const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const dashboardController = require('./dashboard.controller');

router.use(authMiddleware);

router.get('/', dashboardController.getDashboard);

module.exports = router;