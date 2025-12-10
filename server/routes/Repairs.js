const express = require("express");
const router = express.Router();
const controller = require("../controllers/Repairs");
const repairsModel = require("../models/Repairs");
const CrudOperations = require("../crudOperations");

const crud = new CrudOperations(repairsModel);

router.get("/", controller.getRows);
router.get('/getEngines', controller.getDistinctEngineSerials)
router.get("/:id", crud.getById);
router.post("/", crud.create);
router.put("/:id", crud.update);
router.patch("/:id", controller.updateById);
router.delete("/:id", crud.delete);

module.exports = router;
