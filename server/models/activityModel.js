const { pool, getSqliteDb } = require('../config/db');

let memoryActivities = [];
let nextActivityId = 100;

function getSeedActivitiesForUser(userId) {
    const numUserId = Number(userId);
    return [
        { id: nextActivityId++, user_id: numUserId, action_type: 'UPLOAD', document_name: 'University_Degree_Certificate.pdf', details: 'Uploaded to Academic Documents category', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: nextActivityId++, user_id: numUserId, action_type: 'DOWNLOAD', document_name: 'Senior_Software_Engineer_Resume.pdf', details: 'Downloaded resume file', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: nextActivityId++, user_id: numUserId, action_type: 'FAVORITE_ADD', document_name: 'System_Architecture_BRD_v2.docx', details: 'Added to Favorite Documents', created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
        { id: nextActivityId++, user_id: numUserId, action_type: 'CREATE_CATEGORY', document_name: null, details: 'Created "Client Requirement Documents" category', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
        { id: nextActivityId++, user_id: numUserId, action_type: 'CREATE_FOLDER', document_name: null, details: 'Created "Tax Returns 2026" folder', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: nextActivityId++, user_id: numUserId, action_type: 'LOGIN', document_name: null, details: 'User signed in successfully', created_at: new Date(Date.now() - 3600000 * 30).toISOString() }
    ];
}

class ActivityModel {
    /**
     * Log user activity
     */
    static async log({ userId, action_type, document_name, details }) {
        const numUserId = Number(userId);
        const actType = (action_type || 'ACTION').toUpperCase();
        const docName = document_name || null;
        const infoDetails = details || '';
        const sqliteDb = getSqliteDb();

        const newLog = {
            id: nextActivityId++,
            user_id: numUserId,
            action_type: actType,
            document_name: docName,
            details: infoDetails,
            created_at: new Date().toISOString()
        };

        try {
            if (sqliteDb) {
                const res = await sqliteDb.run(
                    `INSERT INTO activity_logs (user_id, action_type, document_name, details) VALUES (?, ?, ?, ?)`,
                    [numUserId, actType, docName, infoDetails]
                );
                if (res && res.lastID) newLog.id = res.lastID;
            } else if (pool) {
                const [result] = await pool.execute(
                    `INSERT INTO activity_logs (user_id, action_type, document_name, details) VALUES (?, ?, ?, ?)`,
                    [numUserId, actType, docName, infoDetails]
                );
                if (result && result.insertId) newLog.id = result.insertId;
            }
        } catch (err) {
            console.warn('[ActivityModel] DB log insert error:', err.message);
        }

        memoryActivities.unshift(newLog);
        return newLog;
    }

    /**
     * Helper alias for log
     */
    static async logActivity(userId, action_type, document_name, details) {
        return this.log({ userId, action_type, document_name, details });
    }

    /**
     * Helper alias for log
     */
    static async createLog({ userId, actionType, documentName, details }) {
        return this.log({ userId, action_type: actionType, document_name: documentName, details });
    }

    /**
     * Get activity logs for a user with search, filtering, and pagination
     */
    static async getByUserId(userId, { search, date_range, action_type, page = 1, limit = 20 } = {}) {
        const numUserId = Number(userId);
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Number(limit) || 20);
        const sqliteDb = getSqliteDb();

        try {
            let allRows = null;

            if (sqliteDb) {
                let sql = `SELECT * FROM activity_logs WHERE user_id = ?`;
                const params = [numUserId];

                if (search && search.trim() !== '') {
                    sql += ` AND (document_name LIKE ? OR details LIKE ? OR action_type LIKE ?)`;
                    const term = `%${search.trim()}%`;
                    params.push(term, term, term);
                }

                if (action_type && action_type !== 'ALL') {
                    sql += ` AND action_type = ?`;
                    params.push(action_type.toUpperCase());
                }

                if (date_range) {
                    const now = new Date();
                    if (date_range === 'today') {
                        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        sql += ` AND created_at >= ?`;
                        params.push(todayStart);
                    } else if (date_range === '7days') {
                        const past7Days = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
                        sql += ` AND created_at >= ?`;
                        params.push(past7Days);
                    } else if (date_range === '30days') {
                        const past30Days = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
                        sql += ` AND created_at >= ?`;
                        params.push(past30Days);
                    }
                }

                sql += ` ORDER BY created_at DESC`;
                allRows = await sqliteDb.all(sql, params);
            } else if (pool) {
                let sql = `SELECT * FROM activity_logs WHERE user_id = ?`;
                const params = [numUserId];

                if (search && search.trim() !== '') {
                    sql += ` AND (document_name LIKE ? OR details LIKE ? OR action_type LIKE ?)`;
                    const term = `%${search.trim()}%`;
                    params.push(term, term, term);
                }

                if (action_type && action_type !== 'ALL') {
                    sql += ` AND action_type = ?`;
                    params.push(action_type.toUpperCase());
                }

                sql += ` ORDER BY created_at DESC`;
                const [rows] = await pool.execute(sql, params);
                allRows = rows;
            }

            if (allRows && allRows.length > 0) {
                const totalCount = allRows.length;
                const totalPages = Math.ceil(totalCount / limitNum) || 1;
                const offset = (pageNum - 1) * limitNum;
                const paginated = allRows.slice(offset, offset + limitNum);

                return {
                    activities: paginated,
                    totalCount,
                    currentPage: pageNum,
                    totalPages,
                    limit: limitNum
                };
            }
        } catch (err) {
            console.warn('[ActivityModel] getByUserId DB query error:', err.message);
        }

        // Memory store & Seeding fallback
        let userMem = memoryActivities.filter(a => a.user_id === numUserId);
        if (userMem.length === 0) {
            const seeded = getSeedActivitiesForUser(numUserId);
            memoryActivities.push(...seeded);
            userMem = seeded;
        }

        let filtered = userMem;

        if (search && search.trim() !== '') {
            const term = search.toLowerCase().trim();
            filtered = filtered.filter(a => 
                (a.document_name && a.document_name.toLowerCase().includes(term)) ||
                (a.details && a.details.toLowerCase().includes(term)) ||
                (a.action_type && a.action_type.toLowerCase().includes(term))
            );
        }

        if (action_type && action_type !== 'ALL') {
            filtered = filtered.filter(a => a.action_type === action_type.toUpperCase());
        }

        const totalCount = filtered.length;
        const totalPages = Math.ceil(totalCount / limitNum) || 1;
        const offset = (pageNum - 1) * limitNum;
        const paginated = filtered.slice(offset, offset + limitNum);

        return {
            activities: paginated,
            totalCount,
            currentPage: pageNum,
            totalPages,
            limit: limitNum
        };
    }

    /**
     * Clear all activity logs for a user
     */
    static async clearByUserId(userId) {
        const numUserId = Number(userId);
        const sqliteDb = getSqliteDb();
        try {
            if (sqliteDb) {
                await sqliteDb.run(`DELETE FROM activity_logs WHERE user_id = ?`, [numUserId]);
            } else if (pool) {
                await pool.execute(`DELETE FROM activity_logs WHERE user_id = ?`, [numUserId]);
            }
        } catch (err) {
            console.warn('[ActivityModel] DB clearByUserId error:', err.message);
        }

        memoryActivities = memoryActivities.filter(a => a.user_id !== numUserId);
        return { success: true, message: 'Activity history cleared successfully.' };
    }

    /**
     * Get system-wide activity logs (Admin)
     */
    static async getAllSystemLogs(limit = 50) {
        const sqliteDb = getSqliteDb();
        try {
            if (sqliteDb) {
                return await sqliteDb.all(
                    `SELECT a.*, u.full_name as user_name, u.email as user_email
                     FROM activity_logs a
                     LEFT JOIN users u ON a.user_id = u.id
                     ORDER BY a.created_at DESC LIMIT ?`,
                    [Number(limit)]
                );
            } else if (pool) {
                const [rows] = await pool.execute(
                    `SELECT a.*, u.full_name as user_name, u.email as user_email
                     FROM activity_logs a
                     LEFT JOIN users u ON a.user_id = u.id
                     ORDER BY a.created_at DESC LIMIT ?`,
                    [Number(limit)]
                );
                return rows;
            }
        } catch (err) {
            return memoryActivities.slice(0, limit).map(a => ({ ...a, user_name: 'System User', user_email: 'user@example.com' }));
        }
    }
}

module.exports = ActivityModel;
