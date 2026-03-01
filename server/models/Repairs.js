const mongoose = require('mongoose');

const RepairSchema = new mongoose.Schema({
  manoiya: String,
  hatakType: String,
  sendingDivision: String,
  sendingBrigade: String,
  sendingBattalion: String,
  tipulType: String,
  zadik: String,
  // cameHas: {
  //   // enum: ['שע"מ', 'שבר'], 
  //   type: String
  // },
  reciveDate: Date //Date
  ,
  engineSerial: { type: String },
  minseretSerial: String,
  hatakStatus: {
    type: String,
    //  enum: ['כשיר', 'בלאי']
  },
  problem: String,
  waitingHHType: [],
  detailsHH: String, // פירוט חח
  recivingDivision: String,
  recivingBrigade: String,
  recivingBattalion: String,
  startWorkingDate: Date //Date
  ,
  pca: String, // פק"ע
  shinoa: String, // שינוע
  shamEngine: String, // שע"מ מנוע
  shamMinseret: String, // שע"מ ממסרת
  actuallyChecked: String, // מה נבדק בפועל
  outgoingEngine: String, // מנוע יוצא
  shamOutgoingEngine: String, // שע"מ מנוע יוצא
  outgoingMinseret: String, // ממסרת יוצאת
  shamOutgoingMinseret: String, // שע"מ ממסרת יוצאת
  engineFaultBank: String, // בנק תקלות מנוע
  minseretFaultBank: String, // בנק תקלות ממסרת
  engineDeactivationNumber: String, // מספר השבתה מנוע
  minseretDeactivationNumber: String, // מספר השבתה ממסרת
  forManoiya: String,
  performenceExpectation: String,
  detailsOfNonCompliance: String, // פירוט אי עמידה
  intended: String,
  addeBy: { fullName: String, pid: String },
  // Marks rows that were "soft deleted" by מנועייה users.
  // These rows are hidden from the main repairs table and shown
  // only in the admin pending-deletion view.
  goingToBeDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });
RepairSchema.index({ engineSerial: 1 })
module.exports = { model: mongoose.model('Repair', RepairSchema), RepairSchema: RepairSchema }
