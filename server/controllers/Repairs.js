const { model } = require('../models/Repairs');
const mongoose = require("mongoose");
const historyModel = require('../models/Repairs_History')
const { getChanges } = require('../Utils/getChanges')



function buildMatchStage(filters) {
  const matchStage = {};
  const reservedKeys = ["_page", "_limit", "_sort", "_order", "pageSize", "page"];

  // Fields that should use partial text search
  const textSearchFields = ["problem", "notes", "description"];

  Object.keys(filters).forEach((key) => {
    if (reservedKeys.includes(key)) return;

    const value = filters[key];

    if (value === "" || value === undefined || value === null) return;

    // Date range: field_from (start of day)
    if (key.endsWith("_from")) {
      const field = key.replace("_from", "");
      if (!matchStage[field]) matchStage[field] = {};
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      matchStage[field].$gte = date;
      return;
    }

    // Date range: field_to (end of day)
    if (key.endsWith("_to")) {
      const field = key.replace("_to", "");
      if (!matchStage[field]) matchStage[field] = {};
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      matchStage[field].$lte = date;
      return;
    }

    // Boolean
    if (value === "true" || value === "false") {
      matchStage[key] = value === "true";
      return;
    }

    // ObjectId
    if (mongoose.Types.ObjectId.isValid(value) && value.length === 24) {
      matchStage[key] = new mongoose.Types.ObjectId(value);
      return;
    }

    // Partial text search for specific fields
    if (textSearchFields.includes(key)) {
      matchStage[key] = { $regex: value, $options: "i" };
      return;
    }

    // Handle comma-separated values (multi-select filters)
    if (typeof value === 'string' && value.includes(',')) {
      const values = value.split(',').map(v => v.trim());
      matchStage[key] = { $in: values };
      return;
    }

    // Exact match for everything else
    matchStage[key] = value;
  });

  return matchStage;
}

const getRows = async (req, res) => {
  try {
    const filters = req.query;
    // Extract pagination parameters
    const pageSize = parseInt(filters.pageSize) || 10;
    const page = parseInt(filters.page) || 0;
    const skip = page * pageSize;

    // Build match stage
    const matchStage = buildMatchStage(filters);

    // Use facet to run count and data queries in parallel within one aggregation

    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Sort by newest first
    pipeline.push({ $sort: { _id: -1 } });

    // Attach last history entry (who updated + when) per repair
    pipeline.push({
      $lookup: {
        from: "repairhistories",
        let: { repairId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$repairId", "$$repairId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "lastHistory",
      },
    });

    pipeline.push({
      $addFields: {
        lastUpdatedBy: { $arrayElemAt: ["$lastHistory.changedBy", 0] },
        lastUpdatedAt: { $arrayElemAt: ["$lastHistory.createdAt", 0] },
      },
    });

    pipeline.push({ $project: { lastHistory: 0 } });

    // Use $facet to get both count and paginated data in one query
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: pageSize }
        ]
      }
    });

    const [result] = await model.aggregate(pipeline).allowDiskUse(true);
 

    const rowsCount = result.metadata.length > 0 ? result.metadata[0].total : 0;
    const data = result.data;

    // Return paginated response with filtered count

    res.json({
      data: data,
      rowsCount: rowsCount,
      page: page,
      pageSize: pageSize
    });
  } catch (err) {
    console.error("Aggregate error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getDistinctValues = async (req, res) => {
  try {
    const validFields = [
      "sendingBrigade",
      "sendingBattalion",
      "engineSerial",
      "minseretSerial",
      "recivingBrigade",
      "recivingBattalion",
    ];

    const response = {};

    // Sequential execution - one at a time
    for (const field of validFields) {
      const values = await model.distinct(field);

      response[field] = values.filter(v => v != null && v !== '');
    }
    res.json(response);
  } catch (err) {
    console.error("Error getting unique values:", err);
    res.status(500).json({ error: "Failed to fetch unique values" });
  }
}

/**
 * GET /api/repairs/unique/:field?search=&skip=&limit=
 * Returns paginated distinct values for a single field.
 *
 * Notes:
 * - MongoDB `distinct()` can't paginate, so we use aggregation: $group + $sort + $skip + $limit.
 * - Response values are filtered to remove null/empty strings.
 */
const getDistinctValuesPaged = async (req, res) => {
  try {
    const { field } = req.params;
    const { search = "", skip = "0", limit = "100" } = req.query;

    const validFields = [
      "sendingBrigade",
      "sendingBattalion",
      "engineSerial",
      "minseretSerial",
      "recivingBrigade",
      "recivingBattalion",
    ];

    if (!validFields.includes(field)) {
      return res.status(400).json({ error: "Invalid field" });
    }

    const parsedSkip = Math.max(parseInt(skip, 10) || 0, 0);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);

    const match = {
      [field]: { $ne: null, $ne: "" },
    };

    // Optional substring search
    if (typeof search === "string" && search.trim().length > 0) {
      match[field] = { $regex: search.trim(), $options: "i" };
    }

    const pipeline = [
      { $match: match },
      { $group: { _id: `$${field}` } },
      { $sort: { _id: 1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: parsedSkip }, { $limit: parsedLimit }],
        },
      },
    ];

    const [result] = await model.aggregate(pipeline).allowDiskUse(true);
    const total = result?.metadata?.[0]?.total || 0;
    const values = (result?.data || [])
      .map((d) => d._id)
      .filter((v) => v != null && v !== "");

    res.json({
      field,
      search: typeof search === "string" ? search : "",
      skip: parsedSkip,
      limit: parsedLimit,
      total,
      values,
      hasMore: parsedSkip + values.length < total,
    });
  } catch (err) {
    console.error("Error getting paged unique values:", err);
    res.status(500).json({ error: "Failed to fetch unique values" });
  }
};

// GET /api/repairs/export/excel?{filters...}&columns=a,b,c
const exportToExcel = async (req, res) => {
  try {
    const filters = req.query || {};
    const matchStage = buildMatchStage(filters);

    // Optional column selection (comma-separated)
    const rawColumns = typeof filters.columns === "string" ? filters.columns : "";
    const columns = rawColumns
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const projection = {};
    if (columns.length > 0) {
      // always include _id for traceability
      projection._id = 1;
      columns.forEach((c) => {
        if (c !== "columns") projection[c] = 1;
      });
    }

    const query = Object.keys(matchStage).length > 0 ? matchStage : {};
    const docs = await model
      .find(query, columns.length > 0 ? projection : undefined)
      .sort({ _id: -1 })
      .lean();

    // Convert to XLSX
    const XLSX = require("xlsx");

    const data = (docs || []).map((d) => {
      const { __v, ...rest } = d;
      return rest;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "repairs");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = "ייצוא_חטכים.xlsx";
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    // RFC 5987 filename* for UTF-8 filenames
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  } catch (err) {
    console.error("Export to excel error:", err);
    res.status(500).json({ error: "Failed to export to excel" });
  }
};


const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { updates, user } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('invalid id');
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      console.log('no update');
      return res.status(400).json({ error: "No fields to update" });
    }

    const oldRepair = await model.findById(id).lean();
    if (!oldRepair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    // Add addedBy info to updates
    const updatesWithUser = {
      ...updates,
      addedBy: {
        fullName: user.fullName,
        pid: user.pid
      }
    };

    const updatedRepair = await model.findByIdAndUpdate(
      id,
      updatesWithUser,
      { new: true }
    ).lean();

    // Get changes for history logging
    const changes = getChanges(oldRepair, updatedRepair);

    if (changes.length > 0) {
      await historyModel.create({
        repairId: id,
        changedBy: { fullName: user.fullName, pid: user.pid },
        changes,
        oldRepair: oldRepair,
        newRepair: updatedRepair
      });
    }

    res.json({
      success: true,
      data: updatedRepair
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
};




// Function to get all distinct engineSerial values from the Repair collection
const getDistinctEngineSerials = async (req, res) => {
  try {
    // Fetch distinct engineSerial values
    const engineSerials = await model.distinct('engineSerial');
    // Return the result as JSON
    res.json(engineSerials);
  } catch (error) {
    console.error('Error fetching distinct engineSerials:', error);
    res.status(500).json({ error: 'Failed to fetch distinct engineSerials' });
  }
}



const getByEngine = async (req, res) => {
  try {
    const engine = req.params.engine;

    const row = await model.findOne({ engineSerial: engine });

    if (!row) {
      return res.status(404).json({ message: "Engine not found" });
    }

    res.json(row);

  } catch (err) {
    console.error("getByEngine error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    // Check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const history = await historyModel.find({ repairId: id });

    if (!history) {
      return res.status(404).json({ message: 'לא קיים היסטוריה על חט"כ זה' });
    }

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  updateById,
  getRows,
  getDistinctEngineSerials,
  getByEngine,
  getHistory,
  getDistinctValues,
  getDistinctValuesPaged,
  exportToExcel,
};  
