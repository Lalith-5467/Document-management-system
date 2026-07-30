const DashboardModel = require('../models/dashboardModel');

class DashboardController {
    // GET /api/dashboard/summary
    static async getSummary(req, res) {
        try {
            const userId = req.user.id;
            const data = await DashboardModel.getSummary(userId);

            return res.status(200).json({
                success: true,
                ...data
            });
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error retrieving dashboard summary.'
            });
        }
    }
}

module.exports = DashboardController;
