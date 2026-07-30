const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/user', ReportController.getUserReports);
router.get('/admin', ReportController.getAdminReports);

module.exports = router;
