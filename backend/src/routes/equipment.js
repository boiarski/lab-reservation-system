const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM equipment');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment' });
    }
});

module.exports = router;