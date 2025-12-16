const { model } = require('../models/Repairs');
const mongoose = require("mongoose");
const historyModel = require('../models/Repairs_History')
const { getChanges } = require('../Utils/getChanges')
function buildMatchStage(filters) {
  const matchStage = {};
  const reservedKeys = ["_page", "_limit", "_sort", "_order"];

  // Fields that should use partial text search
  const textSearchFields = ["problem", "notes", "description"];

  Object.keys(filters).forEach((key) => {
    if (reservedKeys.includes(key)) return;

    const value = filters[key];

    if (value === "" || value === undefined || value === null) return;

    // Date range: field_from
    if (key.endsWith("_from")) {
      const field = key.replace("_from", "");
      if (!matchStage[field]) matchStage[field] = {};
      matchStage[field].$gte = new Date(value);
      return;
    }

    // Date range: field_to
    if (key.endsWith("_to")) {
      const field = key.replace("_to", "");
      if (!matchStage[field]) matchStage[field] = {};
      matchStage[field].$lte = new Date(value);
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

    // Exact match for everything else
    matchStage[key] = value;
  });

  return matchStage;
}


const getRows = async (req, res) => {
  try {
    const filters = req.query;

    // Build match stage
    const matchStage = buildMatchStage(filters);

    // Build pipeline
    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Sort by newest first
    pipeline.push({ $sort: { _id: -1 } });

    const results = await model.aggregate(pipeline).allowDiskUse(true);

    // Return array directly to match your frontend expectation
    res.json(results);
  } catch (err) {
    console.error("Aggregate error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { updates, user } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('invalid id')
      return res.status(400).json({ error: "Invalid ID format" });
    }
    console.log(req.body)
    console.log(updates)
    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      console.log('no update')
      return res.status(400).json({ error: "No fields to update" });
    }
    const oldRepair = await model.findById(id).lean();
    if (!oldRepair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    const updatedRepair = await model.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).lean();


    const changes = getChanges(oldRepair, updatedRepair);
    console.log(changes)

    if (changes.length > 0) {
      await historyModel.create({
        repairId: id,
        changedBy: 'daniel',
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
}



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
    console.log(engine)
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

module.exports = { getByEngine };



module.exports = {
  updateById, getRows, getDistinctEngineSerials, getByEngine
};  
