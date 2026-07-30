const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// GET favorite documents
router.get('/', FavoriteController.getFavorites);

// POST add favorite
router.post('/:documentId', FavoriteController.addFavorite);

// DELETE remove favorite
router.delete('/:documentId', FavoriteController.removeFavorite);

module.exports = router;
