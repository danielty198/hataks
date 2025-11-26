const mongoose = require('mongoose');

const RepairSchema = new mongoose.Schema({
  carModel: { type: String, required: true },
  ownerName: { type: String, required: true },
  repairDate: { type: Date, required: true },
  status: { type: String, enum: ['ממתין', 'בטיפול', 'הושלם'], default: 'ממתין' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Repair', RepairSchema);
