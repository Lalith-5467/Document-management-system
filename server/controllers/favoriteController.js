const FavoriteModel = require('../models/favoriteModel');
const ActivityModel = require('../models/activityModel');

class FavoriteController {
    /**
     * Add a document to favorites
     * POST /api/favorites/:documentId
     */
    static async addFavorite(req, res) {
        try {
            const userId = req.user.id;
            const documentId = req.params.documentId || req.params.id;

            if (!documentId) {
                return res.status(400).json({ success: false, message: 'Document ID is required.' });
            }

            const result = await FavoriteModel.add(userId, documentId);
            
            // Log activity
            ActivityModel.logActivity(userId, 'FAVORITE_ADD', `Document #${documentId}`, 'Added document to favorites');

            return res.status(200).json({
                success: true,
                message: 'Document added to favorites successfully.',
                data: result
            });
        } catch (err) {
            console.error('[FavoriteController] addFavorite error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error while adding favorite.' });
        }
    }

    /**
     * Remove a document from favorites
     * DELETE /api/favorites/:documentId
     */
    static async removeFavorite(req, res) {
        try {
            const userId = req.user.id;
            const documentId = req.params.documentId || req.params.id;

            if (!documentId) {
                return res.status(400).json({ success: false, message: 'Document ID is required.' });
            }

            const result = await FavoriteModel.remove(userId, documentId);
            
            // Log activity
            ActivityModel.logActivity(userId, 'FAVORITE_REMOVE', `Document #${documentId}`, 'Removed document from favorites');

            return res.status(200).json({
                success: true,
                message: 'Document removed from favorites successfully.',
                data: result
            });
        } catch (err) {
            console.error('[FavoriteController] removeFavorite error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error while removing favorite.' });
        }
    }

    /**
     * Get all favorite documents for logged in user
     * GET /api/favorites
     */
    static async getFavorites(req, res) {
        try {
            const userId = req.user.id;
            const favorites = await FavoriteModel.getFavorites(userId);

            return res.status(200).json({
                success: true,
                count: favorites.length,
                favorites
            });
        } catch (err) {
            console.error('[FavoriteController] getFavorites error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error while fetching favorites.' });
        }
    }
}

module.exports = FavoriteController;
