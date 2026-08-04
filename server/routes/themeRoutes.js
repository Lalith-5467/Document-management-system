const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const authenticateToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

// User routes (Preferences)
router.get('/preference', authenticateToken, themeController.getUserPreference);
router.put('/preference', authenticateToken, themeController.saveUserPreference);

// Public/User routes (Read Themes)
router.get('/', authenticateToken, themeController.getThemes);

// Admin routes (CRUD Themes)
router.post('/', authenticateToken, requireAdmin, themeController.createTheme);
router.put('/:id', authenticateToken, requireAdmin, themeController.updateTheme);
router.delete('/:id', authenticateToken, requireAdmin, themeController.deleteTheme);

module.exports = router;
