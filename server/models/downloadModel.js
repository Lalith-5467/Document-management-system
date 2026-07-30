const { pool } = require('../config/db');

let memoryDownloadHistory = [];
let nextHistoryId = 1;

class DownloadModel {
    /**
     * Record a new document download event
     */
    static async recordDownload(userId, documentId) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO download_history (user_id, document_id) VALUES (?, ?)`,
                [userId, documentId]
            );
            return { id: result.insertId, user_id: userId, document_id: documentId, downloaded_at: new Date().toISOString() };
        } catch (err) {
            console.warn('[DownloadModel] Failed to insert download record, using memory fallback:', err.message);
            const entry = {
                id: nextHistoryId++,
                user_id: Number(userId),
                document_id: Number(documentId),
                downloaded_at: new Date().toISOString()
            };
            memoryDownloadHistory.unshift(entry);
            return entry;
        }
    }

    /**
     * Get download history records for a user
     */
    static async getHistoryByUserId(userId, limit = 50) {
        try {
            const sql = `
                SELECT 
                    dh.id,
                    dh.user_id,
                    dh.document_id,
                    dh.downloaded_at,
                    d.title as document_title,
                    d.file_name,
                    d.file_size,
                    d.mime_type
                FROM download_history dh
                LEFT JOIN documents d ON dh.document_id = d.id
                WHERE dh.user_id = ?
                ORDER BY dh.downloaded_at DESC
                LIMIT ?
            `;
            const [rows] = await pool.execute(sql, [userId, limit]);
            return rows;
        } catch (err) {
            return memoryDownloadHistory.filter(h => h.user_id === Number(userId));
        }
    }
}

module.exports = DownloadModel;
