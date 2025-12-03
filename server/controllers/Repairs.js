const model = require('../models/Repairs');
const mongoose = require("mongoose");

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
        const updates = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Validate updates
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Remove _id from updates
        delete updates._id;


        const result = await model.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Failed to update" });
    }
}





module.exports = {
    updateById, getRows,
};  
