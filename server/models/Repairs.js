const mongoose = require('mongoose');

const RepairSchema = new mongoose.Schema({
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
  detailsHH: String,// פירוט חח
  michlalNeed: String,
  recivingDivision: String,
  recivingBrigade: String,
  recivingBattalion: String,
  startWorkingDate: String //Date
  ,
  forManoiya: String,
  performenceExpectation: String,
  detailsOfNonCompliance: String, // פירוט אי עמידה
  intended: String,

}, { timestamps: true });
RepairSchema.index({ engineSerial: 1 })
module.exports = { model: mongoose.model('Repair', RepairSchema), RepairSchema: RepairSchema }
