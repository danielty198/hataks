const { model } = require('../models/Repairs');
const mongoose = require("mongoose");
const historyModel = require('../models/Repairs_History')
const { getChanges } = require('../Utils/getChanges')
const XLSX = require("xlsx");
const formatDateForExcel = (date) => {
  if (!date) return null;
  return new Date(date)
    .toISOString()
    .replace('T', ' ')
    .split('.')[0]; // YYYY-MM-DD HH:mm:ss
};

function buildMatchStage(filters) {
  const matchStage = {};
  const reservedKeys = ["_page", "_limit", "_sort", "_order", "pageSize", "page", "columns"];

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

    // By default, hide rows that are marked to be deleted from the main table.
    // Only when an explicit goingToBeDeleted filter is provided (e.g. true)
    // do we override this behavior.
    if (typeof filters.goingToBeDeleted === "undefined") {
      matchStage.goingToBeDeleted = { $ne: true };
    }

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

const getAll = async (req, res) => {
  try {
    const repairs = await model.find().lean(); // lean = faster + plain objects

    const formattedRepairs = repairs.map(r => ({
      ...r,
      reciveDate: formatDateForExcel(r.reciveDate),
      startWorkingDate: formatDateForExcel(r.startWorkingDate),
      createdAt: formatDateForExcel(r.createdAt),
      updatedAt: formatDateForExcel(r.updatedAt),
    }));

    res.json(formattedRepairs);
  } catch (err) {
    console.error("Error getting all repairs:", err);
    res.status(500).json({ error: "Failed to fetch all repairs" });
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

const fieldHeaderMap = {
  manoiya: "מנועיה",
  hatakType: "סוג חט\"כ",
  sendingDivision: "אוגדה מוסרת",
  sendingBrigade: "חטיבה מוסרת",
  sendingBattalion: "גדוד מוסר",
  zadik: "צ' של כלי",
  reciveDate: "תאריך קבלה",
  engineSerial: "מספר מנוע",
  swapEngineSerial: "החלף מנוע",
  minseretSerial: "מספר ממסרת",
  hatakStatus: "סטטוס חט\"כ",
  tipulType: "סוג טיפול",
  problem: "פירוט תקלה",
  waitingHHType: "סוג ח\"ח ממתין",
  detailsHH: "פירוט ח\"ח",
  michlalNeed: "צריכת מכלל",
  recivingDivision: "אוגדה מקבלת",
  recivingBrigade: "חטיבה מקבלת",
  recivingBattalion: "גדוד מקבל",
  startWorkingDate: "תאריך לפקודה",
  forManoiya: "מנועיה לפקודה",
  performenceExpectation: "צפי ביצוע",
  detailsOfNonCompliance: "פירוט אי עמידה",
  intended: "מיועד ל?",
  updatedAt: "עודכן אחרון",
  history: "היסטוריה",
  edit: "ערוך",
  delete: "מחק",
};
const exportToExcel = async (req, res) => {
  try {
    const filters = req.query || {};
    const matchStage = buildMatchStage(filters);

    const rawColumns = typeof filters.columns === "string" ? filters.columns : "";
    const selectedFields = rawColumns
      ? rawColumns.split(",").map((c) => c.trim()).filter(Boolean)
      : Object.keys(fieldHeaderMap); // all fields if none selected

    const projection = {};
    selectedFields.forEach((field) => {
      projection[field] = 1;
    });

    const query = Object.keys(matchStage).length > 0 ? matchStage : {};
    const docs = await model
      .find(query, projection)
      .sort({ _id: -1 })
      .lean();

    // Prepare data rows
    const dataRows = (docs || []).map((doc) => {
      const row = {};
      selectedFields.forEach((field) => {
        let value = doc[field];

        // Format dates
        if (["reciveDate", "startWorkingDate", "createdAt", "updatedAt"].includes(field)) {
          value = formatDateForExcel(value);
        }

        row[field] = value !== undefined && value !== null ? value : "";
      });
      return row;
    });

    // Build header row from map
    const headers = selectedFields.map((field) => fieldHeaderMap[field] || field);

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataRows, { header: selectedFields });
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    XLSX.utils.sheet_add_json(worksheet, dataRows, { skipHeader: true, origin: "A2" });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "repairs");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = "ייצוא_חטכים.xlsx";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
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

    // ✅ ולידציה של שינוע - אם שווה למנועיה, מאפסים אותו
    const validatedUpdates = { ...updates };
    
    if (validatedUpdates.shinoa) {
      const currentManoiya = validatedUpdates.manoiya || oldRepair.manoiya;
      
      if (validatedUpdates.shinoa === currentManoiya) {
        validatedUpdates.shinoa = "";
        console.log(`Shinoa reset: shinoa (${updates.shinoa}) equals manoiya (${currentManoiya})`);
      }
    }

    // 🔥 Add addedBy info to updates
    const updatesWithUser = {
      ...validatedUpdates,
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

    // 🔥 Get changes for history logging - BEFORE creating history
    const changes = getChanges(oldRepair, updatedRepair);
    
    console.log('🔍 Changes detected:', changes); // DEBUG

    if (changes.length > 0) {
      const historyEntry = await historyModel.create({
        repairId: id,
        changedBy: { fullName: user.fullName, pid: user.pid },
        changes,
        oldRepair: oldRepair,
        newRepair: updatedRepair
      });
      console.log(`✅ Created history entry with ${changes.length} changes, ID: ${historyEntry._id}`);
    } else {
      console.log('⚠️ No changes detected - history not saved');
    }

    res.json({
      success: true,
      data: updatedRepair,
      changesCount: changes.length // 🔥 Return this for debugging
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

    if (!history || history.length === 0) {
      return res.status(404).json({ message: 'לא קיים היסטוריה על חט"כ זה' });
    }

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/**
 * POST /api/repairs/change-engine-serial
 * Body: { sourceId, newEngineSerial, user }
 *
 * Rules:
 * - Only 'admin' or 'manoiya' roles may perform this action.
 * - If newEngineSerial already exists on another row → swap the two engineSerial values.
 * - If newEngineSerial does NOT exist → clone the source row with the new engineSerial,
 *   and on the original row clear minseretSerial.
 */
const changeEngineSerial = async (req, res) => {
  try {
    const { sourceId, newEngineSerial, user } = req.body || {};

    // ... validation code stays the same ...

    const sourceRepair = await model.findById(sourceId).lean();
    if (!sourceRepair) {
      return res.status(404).json({ error: "Source repair not found" });
    }

    const existingTarget = await model
      .findOne({ engineSerial: newEngineSerial })
      .lean();

    // CASE 1: Swap
    if (existingTarget) {
      try {
        const tempEngineSerial = `__TEMP_${sourceRepair.engineSerial}_${Date.now()}`;

        // Step 1: temp value
        await model.findByIdAndUpdate(sourceRepair._id, {
          engineSerial: tempEngineSerial,
          addedBy: { fullName: user.fullName, pid: user.pid },
        });

        // Step 2: swap to target
        const updatedTarget = await model
          .findByIdAndUpdate(
            existingTarget._id,
            {
              engineSerial: sourceRepair.engineSerial,
              addedBy: { fullName: user.fullName, pid: user.pid },
            },
            { new: true }
          )
          .lean();

        // Step 3: final value to source
        const updatedSource = await model
          .findByIdAndUpdate(
            sourceRepair._id,
            {
              engineSerial: newEngineSerial,
              addedBy: { fullName: user.fullName, pid: user.pid },
            },
            { new: true }
          )
          .lean();

        // Log history
        const sourceChanges = getChanges(sourceRepair, updatedSource);
        if (sourceChanges.length > 0) {
          await historyModel.create({
            repairId: sourceRepair._id,
            changedBy: { fullName: user.fullName, pid: user.pid },
            changes: sourceChanges,
            oldRepair: sourceRepair,
            newRepair: updatedSource,
          });
        }

        const targetChanges = getChanges(existingTarget, updatedTarget);
        if (targetChanges.length > 0) {
          await historyModel.create({
            repairId: existingTarget._id,
            changedBy: { fullName: user.fullName, pid: user.pid },
            changes: targetChanges,
            oldRepair: existingTarget,
            newRepair: updatedTarget,
          });
        }

        return res.json({
          success: true,
          mode: "swap",
          data: { source: updatedSource, target: updatedTarget },
        });
      } catch (err) {
        console.error("Engine swap error:", err);
        return res.status(500).json({ error: "Failed to swap engine serials" });
      }
    }

    // CASE 2: Clone
    try {
      const clonedData = {
        ...sourceRepair,
        _id: undefined,
        engineSerial: newEngineSerial,
      };

      const newRepair = await model.create(clonedData);

      const updatedSource = await model
        .findByIdAndUpdate(
          sourceId,
          {
            minseretSerial: "",
            addedBy: { fullName: user.fullName, pid: user.pid },
          },
          { new: true }
        )
        .lean();

      const sourceChanges = getChanges(sourceRepair, updatedSource);
      if (sourceChanges.length > 0) {
        await historyModel.create({
          repairId: sourceId,
          changedBy: { fullName: user.fullName, pid: user.pid },
          changes: sourceChanges,
          oldRepair: sourceRepair,
          newRepair: updatedSource,
        });
      }

      return res.json({
        success: true,
        mode: "clone",
        data: { source: updatedSource, clone: newRepair },
      });
    } catch (err) {
      console.error("Engine clone error:", err);
      return res.status(500).json({ error: "Failed to clone repair" });
    }
  } catch (err) {
    console.error("changeEngineSerial error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  updateById,
  getRows,
  getDistinctEngineSerials,
  getByEngine,
  getHistory,
  getDistinctValues,
  getDistinctValuesPaged,
  exportToExcel,
  getAll,
  changeEngineSerial,
};  
