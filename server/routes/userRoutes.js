const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

module.exports = router;
