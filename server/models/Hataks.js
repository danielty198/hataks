const mongoose = require("mongoose");

const HatakSchema = new mongoose.Schema({
    battalion: { type: String, required: true },
    brigade: { type: String, required: true },
    division: { type: String, required: true },
    engineSerial: { type: String, required: true },
    minseret: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Hatak", HatakSchema);
