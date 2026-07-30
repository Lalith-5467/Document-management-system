const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

// Protected route
router.get('/summary', authenticateToken, DashboardController.getSummary);

module.exports = router;
