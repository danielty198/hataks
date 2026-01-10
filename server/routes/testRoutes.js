const express = require("express");
const router = express.Router();
const controller = require("../controllers/testController");
const { model } = require("../models/Repairs");
const CrudOperations = require("../crudOperations");

const crud = new CrudOperations(model);
router.get("/", controller.seedRepairs);


module.exports = router;
