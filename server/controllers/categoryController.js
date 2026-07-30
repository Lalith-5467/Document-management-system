const CategoryModel = require('../models/categoryModel');

class CategoryController {
    /**
     * GET /api/categories
     * Optionally accepts ?search= or ?q= for filtering.
     */
    static async getAllCategories(req, res) {
        try {
            const userId = (req.user && req.user.id) ? req.user.id : 1;
            const searchQuery = req.query.search || req.query.q;

            let categories;
            if (searchQuery && searchQuery.trim() !== '') {
                categories = await CategoryModel.searchByName(userId, searchQuery);
            } else {
                categories = await CategoryModel.getAllByUserId(userId);
            }

            return res.status(200).json({
                success: true,
                count: categories.length,
                categories
            });
        } catch (err) {
            console.error('[CategoryController] Error fetching categories:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve categories.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/categories/search?q=query
     */
    static async searchCategories(req, res) {
        try {
            const userId = req.user.id;
            const searchQuery = req.query.q || req.query.search || '';

            const categories = await CategoryModel.searchByName(userId, searchQuery);

            return res.status(200).json({
                success: true,
                count: categories.length,
                query: searchQuery,
                categories
            });
        } catch (err) {
            console.error('[CategoryController] Error searching categories:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to search categories.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/categories/:id
     */
    static async getCategoryById(req, res) {
        try {
            const userId = req.user.id;
            const categoryId = req.params.id;

            const category = await CategoryModel.findById(categoryId, userId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found.'
                });
            }

            return res.status(200).json({
                success: true,
                category
            });
        } catch (err) {
            console.error('[CategoryController] Error getting category by ID:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch category details.',
                error: err.message
            });
        }
    }

    /**
     * POST /api/categories
     */
    static async createCategory(req, res) {
        try {
            const userId = (req.user && req.user.id) ? req.user.id : 1;
            const { category_name, name, description, color, icon_name, icon } = req.body;

            const nameToUse = category_name || name;

            if (!nameToUse || nameToUse.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required.'
                });
            }

            const newCategory = await CategoryModel.create({
                userId,
                category_name: nameToUse,
                description,
                color,
                icon_name: icon_name || icon
            });

            return res.status(201).json({
                success: true,
                message: 'Category created successfully!',
                category: newCategory
            });
        } catch (err) {
            console.error('[CategoryController] Error creating category:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create category.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/categories/:id
     */
    static async updateCategory(req, res) {
        try {
            const userId = req.user.id;
            const categoryId = req.params.id;
            const { category_name, name, description, color, icon_name, icon } = req.body;

            const nameToUse = category_name !== undefined ? category_name : name;

            if (nameToUse !== undefined && nameToUse.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Category name cannot be empty.'
                });
            }

            const updatedCategory = await CategoryModel.update(categoryId, userId, {
                category_name: nameToUse,
                description,
                color,
                icon_name: icon_name || icon
            });

            if (!updatedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found or unauthorized to update.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Category updated successfully!',
                category: updatedCategory
            });
        } catch (err) {
            console.error('[CategoryController] Error updating category:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update category.',
                error: err.message
            });
        }
    }

    /**
     * DELETE /api/categories/:id
     */
    static async deleteCategory(req, res) {
        try {
            const userId = req.user.id;
            const categoryId = req.params.id;

            const result = await CategoryModel.delete(categoryId, userId);

            if (!result.success) {
                if (result.reason === 'HAS_DOCUMENTS') {
                    return res.status(400).json({
                        success: false,
                        reason: 'HAS_DOCUMENTS',
                        documentCount: result.documentCount,
                        message: result.message
                    });
                }
                if (result.reason === 'NOT_FOUND') {
                    return res.status(404).json({
                        success: false,
                        message: result.message
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully.'
            });
        } catch (err) {
            console.error('[CategoryController] Error deleting category:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category.',
                error: err.message
            });
        }
    }
}

module.exports = CategoryController;
