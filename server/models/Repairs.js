const mongoose = require('mongoose');

const RepairSchema = new mongoose.Schema({
  manoiya: String,
  hatakType: String,
  sendingDivision: String,
  sendingBrigade: String,
  sendingBattalion: String,
  zadik: String,
  cameHas: {
    // enum: ['שע"מ', 'שבר'], 
    type: String
  },
  reciveDate: String//Date
  ,
  engineSerial: String,
  minseretSerial: String,
  hatakStatus: {
    type: String,
    //  enum: ['כשיר', 'בלאי']
  },
  problem: String,
  waitingHHType: String,
  michlalNeed: String,
  recivingDivision: String,
  recivingBrigade: String,
  recivingBattalion: String,
  startWorkingDate: String //Date
  ,
  forManoiya: String,
  performenceExpectation: String,
  intended: String,

}, { timestamps: true });

module.exports = mongoose.model('Repair', RepairSchema);
