const { model: switchRuleModel } = require("../models/SwitchRule");

const DEFAULT_RULES = [
  {
    name: "סימן 4 / נמר MTU",
    hatakTypes: ["סימן 4", "נמר MTU"],
    forEngine: true,
    forMinseret: true,
  },
  {
    name: "נמר / נמר אחזקה / סימן 3",
    hatakTypes: ["נמר", "נמר אחזקה", "סימן 3"],
    forEngine: true,
    forMinseret: true,
  },
  {
    name: "פומה",
    hatakTypes: ["פומה רגיל", "פומה+", "פומה++"],
    forEngine: true,
    forMinseret: true,
  },
];

/**
 * Seed default rules if collection is empty
 */
const seedDefaultsIfEmpty = async () => {
  const count = await switchRuleModel.countDocuments();
  if (count === 0) {
    await switchRuleModel.insertMany(DEFAULT_RULES);
  }
};

/**
 * GET /api/switch-rules
 */
const list = async (req, res) => {
  try {
    await seedDefaultsIfEmpty();
    const rules = await switchRuleModel.find().sort({ createdAt: 1 }).lean();
    res.json(rules);
  } catch (err) {
    console.error("SwitchRules list error:", err);
    res.status(500).json({ error: "Failed to list switch rules" });
  }
};

/**
 * POST /api/switch-rules
 */
const create = async (req, res) => {
  try {
    const { name = "", hatakTypes = [], forEngine = true, forMinseret = true } = req.body || {};
    if (!Array.isArray(hatakTypes) || hatakTypes.length === 0) {
      return res.status(400).json({ error: "hatakTypes must be a non-empty array" });
    }
    const rule = await switchRuleModel.create({
      name: String(name),
      hatakTypes: hatakTypes.map(String),
      forEngine: !!forEngine,
      forMinseret: !!forMinseret,
    });
    res.status(201).json(rule);
  } catch (err) {
    console.error("SwitchRules create error:", err);
    res.status(500).json({ error: "Failed to create switch rule" });
  }
};

/**
 * PATCH /api/switch-rules/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hatakTypes, forEngine, forMinseret } = req.body || {};
    const updateDoc = {};
    if (name !== undefined) updateDoc.name = String(name);
    if (Array.isArray(hatakTypes)) updateDoc.hatakTypes = hatakTypes.map(String);
    if (forEngine !== undefined) updateDoc.forEngine = !!forEngine;
    if (forMinseret !== undefined) updateDoc.forMinseret = !!forMinseret;
    const rule = await switchRuleModel
      .findByIdAndUpdate(id, updateDoc, { new: true })
      .lean();
    if (!rule) return res.status(404).json({ error: "Switch rule not found" });
    res.json(rule);
  } catch (err) {
    console.error("SwitchRules update error:", err);
    res.status(500).json({ error: "Failed to update switch rule" });
  }
};

/**
 * DELETE /api/switch-rules/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await switchRuleModel.findByIdAndDelete(id);
    if (!rule) return res.status(404).json({ error: "Switch rule not found" });
    res.json({ deleted: true, id });
  } catch (err) {
    console.error("SwitchRules remove error:", err);
    res.status(500).json({ error: "Failed to delete switch rule" });
  }
};

/**
 * Returns array of hatakTypes that can switch with the given hatakType
 * for the given field ('engineSerial' or 'minseretSerial').
 * Used by Repairs controller for validation and compatible-for-swap.
 */
const getCompatibleHatakTypes = async (hatakType, field) => {
  const flag = field === "engineSerial" ? "forEngine" : "forMinseret";
  const rules = await switchRuleModel
    .find({ [flag]: true, hatakTypes: hatakType })
    .lean();
  const compatible = new Set();
  rules.forEach((r) => r.hatakTypes.forEach((t) => compatible.add(t)));
  return Array.from(compatible);
};

module.exports = {
  list,
  create,
  update,
  remove,
  getCompatibleHatakTypes,
};
