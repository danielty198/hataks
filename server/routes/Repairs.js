const express = require('express');
const router = express.Router();
const Repair = require('../models/Repairs');

// GET all
router.get('/', async (req, res) => {
  try {
    const repairs = await Repair.find().sort({ repairDate: -1 });
    res.json(repairs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const r = await Repair.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'לא נמצא' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const newRepair = new Repair(req.body);
    const saved = await newRepair.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Repair.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Repair.findByIdAndDelete(req.params.id);
    res.json({ message: 'נמחק' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
