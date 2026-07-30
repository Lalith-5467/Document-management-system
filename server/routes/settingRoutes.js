const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/settingController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// User settings endpoints
router.get('/user', SettingController.getUserSettings);
router.put('/user/profile', SettingController.updateUserProfile);
router.put('/user/password', SettingController.changePassword);
router.put('/user/preferences', SettingController.savePreferences);

module.exports = router;
