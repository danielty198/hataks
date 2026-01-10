const express = require('express');
const router = express.Router();
const controller = require('../controllers/biController');

// Get pie chart data - aggregated by hatakType and hatakStatus
router.get('/pie-data', controller.getPieData);

// Get complex table data - aggregated by hatakType, manoiya, and hatakStatus
router.get('/table-data', controller.getTableData);

// Get summary statistics
router.get('/summary', controller.getSummary);

module.exports = router;
