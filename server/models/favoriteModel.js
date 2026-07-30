const { pool, getSqliteDb } = require('../config/db');

class FavoriteModel {
    /**
     * Add document to favorites for user
     */
    static async add(userId, documentId) {
        const numUserId = Number(userId);
        const numDocId = Number(documentId);
        const sqliteDb = getSqliteDb();

        try {
            if (sqliteDb) {
                await sqliteDb.run(
                    `INSERT OR IGNORE INTO favorites (user_id, document_id) VALUES (?, ?)`,
                    [numUserId, numDocId]
                );
                await sqliteDb.run(
                    `UPDATE documents SET is_favorite = 1 WHERE id = ? AND user_id = ?`,
                    [numDocId, numUserId]
                );
            } else if (pool) {
                await pool.execute(
                    `INSERT IGNORE INTO favorites (user_id, document_id) VALUES (?, ?)`,
                    [numUserId, numDocId]
                );
                await pool.execute(
                    `UPDATE documents SET is_favorite = 1 WHERE id = ? AND user_id = ?`,
                    [numDocId, numUserId]
                );
            }
        } catch (err) {
            console.warn('[FavoriteModel] DB favorite add error:', err.message);
        }

        // Also sync memory store if active
        try {
            const DocumentModel = require('./documentModel');
            DocumentModel.toggleFavorite(numDocId, numUserId, true);
        } catch (e) {}

        return { success: true, is_favorite: true, document_id: numDocId };
    }

    /**
     * Remove document from favorites for user
     */
    static async remove(userId, documentId) {
        const numUserId = Number(userId);
        const numDocId = Number(documentId);
        const sqliteDb = getSqliteDb();

        try {
            if (sqliteDb) {
                await sqliteDb.run(
                    `DELETE FROM favorites WHERE user_id = ? AND document_id = ?`,
                    [numUserId, numDocId]
                );
                await sqliteDb.run(
                    `UPDATE documents SET is_favorite = 0 WHERE id = ? AND user_id = ?`,
                    [numDocId, numUserId]
                );
            } else if (pool) {
                await pool.execute(
                    `DELETE FROM favorites WHERE user_id = ? AND document_id = ?`,
                    [numUserId, numDocId]
                );
                await pool.execute(
                    `UPDATE documents SET is_favorite = 0 WHERE id = ? AND user_id = ?`,
                    [numDocId, numUserId]
                );
            }
        } catch (err) {
            console.warn('[FavoriteModel] DB favorite remove error:', err.message);
        }

        // Also sync memory store if active
        try {
            const DocumentModel = require('./documentModel');
            DocumentModel.toggleFavorite(numDocId, numUserId, false);
        } catch (e) {}

        return { success: true, is_favorite: false, document_id: numDocId };
    }

    /**
     * Get all favorite documents for user
     */
    static async getFavorites(userId) {
        const numUserId = Number(userId);
        const sqliteDb = getSqliteDb();
        try {
            if (sqliteDb) {
                const favRows = await sqliteDb.all(
                    `SELECT d.*, c.category_name, c.color as category_color, f.folder_name
                     FROM documents d
                     LEFT JOIN categories c ON d.category_id = c.id
                     LEFT JOIN folders f ON d.folder_id = f.id
                     WHERE d.user_id = ? AND (d.is_archived = 0 OR d.is_archived IS NULL)
                       AND (d.is_favorite = 1 OR d.id IN (SELECT document_id FROM favorites WHERE user_id = ?))
                     ORDER BY d.updated_at DESC`,
                    [numUserId, numUserId]
                );
                return (favRows || []).map(r => ({ ...r, is_favorite: 1 }));
            }
        } catch (e) {
            console.warn('[FavoriteModel] Direct SQL favorites query error:', e.message);
        }

        try {
            const DocumentModel = require('./documentModel');
            const res = await DocumentModel.getAllByUserId(numUserId, { is_favorite: true });
            const docsList = Array.isArray(res) ? res : (res?.documents || []);
            return docsList.filter(doc => Boolean(doc.is_favorite));
        } catch (err) {
            console.warn('[FavoriteModel] getFavorites failed:', err.message);
            return [];
        }
    }
}

module.exports = FavoriteModel;
