const UserModel = require('../models/userModel');
const { getSqliteDb, getIsSQLite, pool } = require('../config/db');

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

            const nameToUpdate = (fullName || full_name || '').toString().trim();
            const typeToUpdate = (userType || user_type || '').toString().trim();

            const user = await UserModel.findById(userId) || {};

            let designation = user.designation || null;
            let department = user.department || null;
            let occupation = user.occupation || null;
            let company_name = user.company_name || null;
            let college_name = user.college_name || null;
            let city = user.city || null;
            let mobile_number = phone !== undefined ? (phone ? phone.toString().trim() : null) : (user.mobile_number || null);

            if (job_title !== undefined && job_title !== null) {
                const cleanTitle = job_title.toString().trim();
                if (typeToUpdate === 'professional') designation = cleanTitle || null;
                else if (typeToUpdate === 'student') department = cleanTitle || null;
                else occupation = cleanTitle || null;
            }

            if (organization !== undefined && organization !== null) {
                const cleanOrg = organization.toString().trim();
                if (typeToUpdate === 'professional') company_name = cleanOrg || null;
                else if (typeToUpdate === 'student') college_name = cleanOrg || null;
                else company_name = cleanOrg || null;
            }

            if (location !== undefined && location !== null) {
                city = location.toString().trim() || null;
            }

            const nameVal = nameToUpdate || user.full_name || 'User';
            const typeVal = typeToUpdate || user.user_type || 'individual';
            const mobileVal = mobile_number || null;
            const desigVal = designation || null;
            const deptVal = department || null;
            const occVal = occupation || null;
            const compVal = company_name || null;
            const collVal = college_name || null;
            const cityVal = city || null;

            if (getIsSQLite()) {
                const sqliteDb = getSqliteDb();
                if (sqliteDb) {
                    await sqliteDb.run(
                        `UPDATE users SET full_name = ?, user_type = ?, mobile_number = ?, designation = ?, department = ?, occupation = ?, company_name = ?, college_name = ?, city = ? WHERE id = ?`,
                        [nameVal, typeVal, mobileVal, desigVal, deptVal, occVal, compVal, collVal, cityVal, userId]
                    );
                }
            } else if (pool) {
                await pool.execute(
                    `UPDATE users SET full_name = ?, user_type = ?, mobile_number = ?, designation = ?, department = ?, occupation = ?, company_name = ?, college_name = ?, city = ? WHERE id = ?`,
                    [nameVal, typeVal, mobileVal, desigVal, deptVal, occVal, compVal, collVal, cityVal, userId]
                );
            }

            const updatedUser = (await UserModel.findById(userId)) || {
                ...user,
                id: userId,
                full_name: nameVal,
                user_type: typeVal,
                mobile_number: mobileVal,
                designation: desigVal,
                department: deptVal,
                occupation: occVal,
                company_name: compVal,
                college_name: collVal,
                city: cityVal
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
