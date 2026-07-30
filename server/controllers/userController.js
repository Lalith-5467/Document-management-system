const UserModel = require('../models/userModel');

class UserController {
    /**
     * GET /api/users/profile
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User profile not found.'
                });
            }

            return res.status(200).json({
                success: true,
                user
            });
        } catch (err) {
            console.error('[UserController] Error fetching profile:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/users/profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { fullName, full_name, userType, user_type, job_title, organization, phone, location } = req.body;

            const nameToUpdate = fullName || full_name;
            const typeToUpdate = userType || user_type;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            const updatedUser = {
                ...user,
                full_name: nameToUpdate || user.full_name,
                user_type: typeToUpdate || user.user_type,
                job_title: job_title !== undefined ? job_title : user.job_title,
                organization: organization !== undefined ? organization : user.organization,
                phone: phone !== undefined ? phone : user.phone,
                location: location !== undefined ? location : user.location
            };

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully!',
                user: updatedUser
            });
        } catch (err) {
            console.error('[UserController] Error updating profile:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile.',
                error: err.message
            });
        }
    }
}

module.exports = UserController;
