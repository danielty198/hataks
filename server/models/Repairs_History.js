const mongoose = require('mongoose');
const {RepairSchema} = require('../models/Repairs')
const repairHistorySchema = new mongoose.Schema(
  {
    repairId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repair',
      required: true,
    },

    changedBy: {
      type: String, // userId / email / system
      required: true,
    },
    oldRepair: RepairSchema,
    newRepair: RepairSchema,
    changes: [
      {
        field: {
          type: String,
          required: true,
        },
        oldValue: {
          type: mongoose.Schema.Types.Mixed,
        },
        newValue: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
  },
  { timestamps: true }
);

// Helpful index for history lookups
repairHistorySchema.index({ repairId: 1, createdAt: 1 });

module.exports = mongoose.model('RepairHistory', repairHistorySchema);
