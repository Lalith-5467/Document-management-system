const ActivityModel = require('../models/activityModel');

class ActivityController {
    /**
     * GET /api/activity
     * Search, filter, and paginate activity history for the logged-in user
     */
    static async getActivities(req, res) {
        try {
            const userId = req.user.id;
            const { search, date_range, action_type, page = 1, limit = 20 } = req.query;

            const result = await ActivityModel.getByUserId(userId, {
                search,
                date_range,
                action_type,
                page: Number(page) || 1,
                limit: Number(limit) || 20
            });

            return res.status(200).json({
                success: true,
                count: result.activities.length,
                totalCount: result.totalCount,
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                limit: result.limit,
                activities: result.activities
            });
        } catch (err) {
            console.error('[ActivityController] Error fetching activity logs:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve activity logs.',
                error: err.message
            });
        }
    }

    /**
     * DELETE /api/activity
     * Clear all activity history for the logged-in user
     */
    static async clearActivities(req, res) {
        try {
            const userId = req.user.id;
            const result = await ActivityModel.clearByUserId(userId);

            // Log activity clear action
            ActivityModel.logActivity(userId, 'ACTIVITY_CLEAR', null, 'Cleared user activity history logs');

            return res.status(200).json({
                success: true,
                message: 'Activity history cleared successfully.',
                result
            });
        } catch (err) {
            console.error('[ActivityController] Error clearing activity logs:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to clear activity history.',
                error: err.message
            });
        }
    }
}

module.exports = ActivityController;
