const mongoose = require("mongoose");

const SwitchRuleSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    hatakTypes: [{ type: String, required: true }],
    forEngine: { type: Boolean, default: true },
    forMinseret: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = {
  model: mongoose.model("SwitchRule", SwitchRuleSchema),
  schema: SwitchRuleSchema,
};
