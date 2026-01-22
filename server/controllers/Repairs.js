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
  updateById, getRows, getDistinctEngineSerials, getByEngine, getHistory, getDistinctValues
};  
