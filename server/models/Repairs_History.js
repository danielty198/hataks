const mongoose = require('mongoose');
const { RepairSchema } = require('../models/Repairs')


const repairObject = {
  manoiya: String,
  hatakType: String,
  sendingDivision: String,
  sendingBrigade: String,
  sendingBattalion: String,
  tipulType: String,
  zadik: String,
  cameHas: {
    // enum: ['שע"מ', 'שבר'], 
    type: String
  },
  reciveDate: String//Date
  ,
  engineSerial: { type: String, required: true, unique: true, },
  minseretSerial: String,
  hatakStatus: {
    type: String,
    //  enum: ['כשיר', 'בלאי']
  },
  problem: String,
  waitingHHType: [],
  michlalNeed: String,
  recivingDivision: String,
  recivingBrigade: String,
  recivingBattalion: String,
  startWorkingDate: String //Date
  ,
  forManoiya: String,
  performenceExpectation: String,
  intended: String,
}




const repairHistorySchema = new mongoose.Schema(
  {
    repairId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repair',
      required: true,
    },

    changedBy: Object,
    oldRepair: Object,
    newRepair: Object,
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
