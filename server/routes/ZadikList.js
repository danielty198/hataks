const express = require('express');
const router = express.Router();
const { sql } = require('../Utils/sql');

// Autocomplete endpoint
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, limit = 100 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        error: 'Search query parameter "q" is required' 
      });
    }

    const searchPattern = `%${q}%`;
    
    const result = await sql.query`
      SELECT TOP ${parseInt(limit)}
        *
      FROM [General].[dbo].[STG_ZadikList]
      WHERE 
        CAST(ZadikId AS NVARCHAR) LIKE ${searchPattern}
        OR ZadikName LIKE ${searchPattern}
        OR ZadikCode LIKE ${searchPattern}
      ORDER BY
        CASE 
          WHEN CAST(ZadikId AS NVARCHAR) = ${searchPattern} THEN 1
          WHEN CAST(ZadikId AS NVARCHAR) LIKE ${searchPattern} + '%' THEN 2
          WHEN ZadikName LIKE ${searchPattern} + '%' THEN 3
          ELSE 4
        END,
        ZadikName
    `;
    
    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Autocomplete error:', err);
    res.status(500).json({ 
      error: 'Failed to search zadiks',
      message: err.message 
    });
  }
});

// Get zadik by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql.query`
      SELECT *
      FROM [General].[dbo].[STG_ZadikList]
      WHERE ZadikId = ${id}
    `;
    
    if (!result.recordset[0]) {
      return res.status(404).json({ 
        error: 'Zadik not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (err) {
    console.error('Get zadik error:', err);
    res.status(500).json({ 
      error: 'Failed to get zadik',
      message: err.message 
    });
  }
});

// Get all zadiks with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    
    const result = await sql.query`
      SELECT *
      FROM [General].[dbo].[STG_ZadikList]
      ORDER BY ZadikName
      OFFSET ${offset} ROWS
      FETCH NEXT ${parseInt(pageSize)} ROWS ONLY
    `;
    
    res.json({
      success: true,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Get zadiks error:', err);
    res.status(500).json({ 
      error: 'Failed to get zadiks',
      message: err.message 
    });
  }
});

module.exports = router;
