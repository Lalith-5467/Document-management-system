const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const authenticateToken = require('../middleware/authMiddleware');

// All category routes require JWT authentication
router.use(authenticateToken);

// GET search categories (must come before /:id)
router.get('/search', CategoryController.searchCategories);

// GET all categories (supports ?search= query param as well)
router.get('/', CategoryController.getAllCategories);

// GET category details by ID
router.get('/:id', CategoryController.getCategoryById);

// POST create new category
router.post('/', CategoryController.createCategory);

// PUT update category
router.put('/:id', CategoryController.updateCategory);

// DELETE category
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;
