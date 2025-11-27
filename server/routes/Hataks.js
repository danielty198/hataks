const express = require("express");
const router = express.Router();

const hataksModel = require("../models/Hataks");

const CrudOperations = require("../crudOperations");


const crud = new CrudOperations(hataksModel);

router.get("/", crud.getAll);
router.get("/:id", crud.getById);
router.post("/", crud.create);
router.put("/:id", crud.update);
router.delete("/:id", crud.delete);

module.exports = router;
