const SettingModel = require('../models/settingModel');

class SettingController {
    /**
     * GET /api/settings/user
     */
    static async getUserSettings(req, res) {
        try {
            const userId = req.user.id;
            const data = await SettingModel.getUserSettings(userId);
            return res.status(200).json({
                success: true,
                ...data
            });
        } catch (err) {
            console.error('[SettingController] getUserSettings error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve user settings.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/settings/user/profile
     */
    static async updateUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const { full_name, email, avatar } = req.body;

            if (!full_name || !full_name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Full Name is required.'
                });
            }

            const result = await SettingModel.updateUserProfile(userId, { full_name: full_name.trim(), email: (email || '').trim(), avatar });
            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully!',
                ...result
            });
        } catch (err) {
            console.error('[SettingController] updateUserProfile error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/settings/user/password
     */
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required.'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long.'
                });
            }

            const result = await SettingModel.changePassword(userId, { currentPassword, newPassword });
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            console.error('[SettingController] changePassword error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to change password.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/settings/user/preferences
     */
    static async savePreferences(req, res) {
        try {
            const userId = req.user.id;
            const { theme, language } = req.body;

            const result = await SettingModel.savePreferences(userId, { theme, language });
            return res.status(200).json({
                success: true,
                message: 'Preferences saved successfully.',
                ...result
            });
        } catch (err) {
            console.error('[SettingController] savePreferences error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to save preferences.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/admin/settings
     */
    static async getAdminSettings(req, res) {
        try {
            const data = await SettingModel.getAdminSettings();
            return res.status(200).json({
                success: true,
                ...data
            });
        } catch (err) {
            console.error('[SettingController] getAdminSettings error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve admin settings.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/admin/settings
     */
    static async updateAdminSettings(req, res) {
        try {
            const { max_upload_size, allowed_file_types } = req.body;
            const result = await SettingModel.updateAdminSettings({ max_upload_size, allowed_file_types });

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            console.error('[SettingController] updateAdminSettings error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update admin settings.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/admin/backup
     * Download database backup snapshot JSON
     */
    static async downloadBackup(req, res) {
        try {
            const backupSnapshot = await SettingModel.generateBackup();
            const fileName = `DocVault_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.status(200).send(JSON.stringify(backupSnapshot, null, 2));
        } catch (err) {
            console.error('[SettingController] downloadBackup error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate database backup.',
                error: err.message
            });
        }
    }

    /**
     * POST /api/admin/restore
     * Restore database from snapshot JSON payload
     */
    static async restoreBackup(req, res) {
        try {
            const backupData = req.body;
            const result = await SettingModel.restoreBackup(backupData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            console.error('[SettingController] restoreBackup error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to restore database.',
                error: err.message
            });
        }
    }
}

module.exports = SettingController;
