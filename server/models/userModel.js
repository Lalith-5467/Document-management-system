const { pool, getIsSQLite, getSqliteDb } = require('../config/db');

// In-memory fallback store for development environment if DB is offline
const memoryUsers = [];

class UserModel {
    static async findByEmail(email) {
        try {
            if (getIsSQLite()) {
                const db = getSqliteDb();
                const user = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
                if (user) return user;
            }

            const [rows] = await pool.execute('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
            if (rows && rows[0]) return rows[0];

            return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        } catch (err) {
            console.warn('[UserModel] Database query warning in findByEmail:', err.message);
            return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        }
    }

    static async findById(id) {
        try {
            if (getIsSQLite()) {
                const db = getSqliteDb();
                const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                }
            }

            const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
            if (rows && rows[0]) {
                const { password, ...userWithoutPassword } = rows[0];
                return userWithoutPassword;
            }
            return null;
        } catch (err) {
            const user = memoryUsers.find(u => u.id === Number(id));
            if (!user) return null;
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    }

    static async findByMobile(mobile) {
        try {
            if (getIsSQLite()) {
                const db = getSqliteDb();
                const user = await db.get('SELECT * FROM users WHERE mobile_number = ?', [mobile]);
                if (user) return user;
            }

            const [rows] = await pool.execute('SELECT * FROM users WHERE mobile_number = ?', [mobile]);
            if (rows && rows[0]) return rows[0];

            return memoryUsers.find(u => u.mobile_number === mobile) || null;
        } catch (err) {
            return memoryUsers.find(u => u.mobile_number === mobile) || null;
        }
    }

    static async create(userData) {
        const {
            fullName, email, password, userType, mobileNumber, phoneVerified, emailVerified,
            collegeName, department, yearOfStudy, studentId,
            companyName, designation, industry, yearsOfExperience, employeeId,
            occupation, country, state, city
        } = userData;

        const isEmailVerified = emailVerified || phoneVerified ? 1 : 0;

        try {
            if (getIsSQLite()) {
                const db = getSqliteDb();
                const res = await db.run(
                    `INSERT INTO users (
                        full_name, email, password, user_type, mobile_number, phone_verified, email_verified,
                        college_name, department, year_of_study, student_id,
                        company_name, designation, industry, years_of_experience, employee_id,
                        occupation, country, state, city
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        fullName, email, password, userType || 'individual', mobileNumber || null, phoneVerified ? 1 : 0, isEmailVerified,
                        collegeName || null, department || null, yearOfStudy || null, studentId || null,
                        companyName || null, designation || null, industry || null, yearsOfExperience || null, employeeId || null,
                        occupation || null, country || null, state || null, city || null
                    ]
                );
                const newId = res.lastID;
                const createdUser = {
                    id: newId,
                    full_name: fullName,
                    email,
                    user_type: userType || 'individual',
                    mobile_number: mobileNumber || null
                };
                memoryUsers.push({ ...createdUser, password });
                return createdUser;
            }

            const [result] = await pool.execute(
                `INSERT INTO users (
                    full_name, email, password, user_type, mobile_number, phone_verified, email_verified,
                    college_name, department, year_of_study, student_id,
                    company_name, designation, industry, years_of_experience, employee_id,
                    occupation, country, state, city
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    fullName, email, password, userType || 'individual', mobileNumber || null, phoneVerified ? 1 : 0, isEmailVerified,
                    collegeName || null, department || null, yearOfStudy || null, studentId || null,
                    companyName || null, designation || null, industry || null, yearsOfExperience || null, employeeId || null,
                    occupation || null, country || null, state || null, city || null
                ]
            );
            const createdUser = {
                id: result.insertId,
                full_name: fullName,
                email,
                user_type: userType || 'individual',
                mobile_number: mobileNumber || null
            };
            memoryUsers.push({ ...createdUser, password });
            return createdUser;
        } catch (err) {
            const newUser = {
                id: memoryUsers.length + 1,
                full_name: fullName,
                email,
                password,
                user_type: userType || 'individual',
                mobile_number: mobileNumber || null,
                phone_verified: phoneVerified ? 1 : 0,
                email_verified: isEmailVerified,
                college_name: collegeName || null,
                department: department || null,
                year_of_study: yearOfStudy || null,
                student_id: studentId || null,
                company_name: companyName || null,
                designation: designation || null,
                industry: industry || null,
                years_of_experience: yearsOfExperience || null,
                employee_id: employeeId || null,
                occupation: occupation || null,
                country: country || null,
                state: state || null,
                city: city || null,
                created_at: new Date()
            };
            memoryUsers.push(newUser);
            return {
                id: newUser.id,
                full_name: newUser.full_name,
                email: newUser.email,
                user_type: newUser.user_type
            };
        }
    }

    static async updatePassword(id, hashedPassword) {
        try {
            if (getIsSQLite()) {
                const db = getSqliteDb();
                await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
            } else {
                await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
            }
            const user = memoryUsers.find(u => u.id === Number(id));
            if (user) user.password = hashedPassword;
            return true;
        } catch (err) {
            const user = memoryUsers.find(u => u.id === Number(id));
            if (user) user.password = hashedPassword;
            return true;
        }
    }
}

module.exports = UserModel;
