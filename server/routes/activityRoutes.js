const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activityController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', ActivityController.getActivities);
router.delete('/', ActivityController.clearActivities);

module.exports = router;
