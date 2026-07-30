const { pool } = require('../config/db');

// In-memory fallback store for development environment if MySQL server is offline
const memoryUsers = [];

class UserModel {
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0] || null;
        } catch (err) {
            console.warn('[UserModel] Using fallback memory store (MySQL connection failed or offline)');
            return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT id, full_name, email, user_type, created_at FROM users WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (err) {
            const user = memoryUsers.find(u => u.id === Number(id));
            if (!user) return null;
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    }

    static async create({ fullName, email, password, userType }) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO users (full_name, email, password, user_type) VALUES (?, ?, ?, ?)',
                [fullName, email, password, userType || 'individual']
            );
            return {
                id: result.insertId,
                full_name: fullName,
                email,
                user_type: userType || 'individual'
            };
        } catch (err) {
            const newUser = {
                id: memoryUsers.length + 1,
                full_name: fullName,
                email,
                password,
                user_type: userType || 'individual',
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
}

module.exports = UserModel;
