const express = require("express");
const router = express.Router();
const controller = require("../controllers/Repairs");
const { model } = require("../models/Repairs");
const CrudOperations = require("../crudOperations");

const crud = new CrudOperations(model);

router.get("/", controller.getRows);
router.get('/getByEngine/:engine', controller.getByEngine)
router.get('/getEngines', controller.getDistinctEngineSerials)
router.get('/getHistory/:id', controller.getHistory)
router.get('/unique',controller.getDistinctValues)
router.get("/:id", crud.getById);
router.post("/", crud.create);
router.put("/:id", crud.update);
router.patch("/:id", controller.updateById);
router.delete("/:id", crud.delete);

module.exports = router;
