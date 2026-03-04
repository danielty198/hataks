const express = require("express");
const router = express.Router();
const controller = require("../controllers/Repairs");
const { model } = require("../models/Repairs");
const CrudOperations = require("../crudOperations");

const crud = new CrudOperations(model);

// List michlol repairs (engine XOR minseret)
router.get("/", controller.getMichlolRows);

// Export michlol repairs to Excel
router.get("/export/excel", controller.exportMichlolToExcel);

// Reuse generic CRUD for single record operations (mainly for edit)
router.get("/:id", crud.getById);
router.patch("/:id", controller.updateById);

module.exports = router;

