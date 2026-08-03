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

            let designation = user.designation;
            let department = user.department;
            let occupation = user.occupation;
            let company_name = user.company_name;
            let college_name = user.college_name;
            let city = user.city;
            let mobile_number = phone !== undefined ? phone : user.mobile_number;

            if (job_title !== undefined) {
                if (typeToUpdate === 'professional') designation = job_title;
                else if (typeToUpdate === 'student') department = job_title;
                else occupation = job_title;
            }

            if (organization !== undefined) {
                if (typeToUpdate === 'professional') company_name = organization;
                else if (typeToUpdate === 'student') college_name = organization;
            }

            if (location !== undefined) {
                city = location;
            }

            const { getSqliteDb, pool } = require('../config/db');
            const sqliteDb = getSqliteDb();

            if (sqliteDb) {
                await sqliteDb.run(
                    `UPDATE users SET full_name = ?, user_type = ?, mobile_number = ?, designation = ?, department = ?, occupation = ?, company_name = ?, college_name = ?, city = ? WHERE id = ?`,
                    [nameToUpdate || user.full_name, typeToUpdate || user.user_type, mobile_number, designation, department, occupation, company_name, college_name, city, userId]
                );
            } else if (pool) {
                await pool.execute(
                    `UPDATE users SET full_name = ?, user_type = ?, mobile_number = ?, designation = ?, department = ?, occupation = ?, company_name = ?, college_name = ?, city = ? WHERE id = ?`,
                    [nameToUpdate || user.full_name, typeToUpdate || user.user_type, mobile_number, designation, department, occupation, company_name, college_name, city, userId]
                );
            }

            const updatedUser = await UserModel.findById(userId);

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
