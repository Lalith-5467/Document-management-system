const ReportModel = require('../models/reportModel');

class ReportController {
    /**
     * GET /api/reports/user
     * Get user-specific analytics and dashboard reports
     */
    static async getUserReports(req, res) {
        try {
            const userId = req.user.id;
            const { date_range } = req.query;

            const reports = await ReportModel.getUserReports(userId, { date_range });

            return res.status(200).json({
                success: true,
                reports
            });
        } catch (error) {
            console.error('[ReportController] getUserReports error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve user report analytics.',
                error: error.message
            });
        }
    }

    /**
     * GET /api/reports/admin
     * Get system-wide admin analytics and reports
     */
    static async getAdminReports(req, res) {
        try {
            const { date_range } = req.query;
            const reports = await ReportModel.getAdminReports({ date_range });

            return res.status(200).json({
                success: true,
                reports
            });
        } catch (error) {
            console.error('[ReportController] getAdminReports error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve system admin reports.',
                error: error.message
            });
        }
    }
}

module.exports = ReportController;
