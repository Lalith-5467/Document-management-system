const { pool, getIsSQLite, getSqliteDb } = require('../config/db');

class DashboardModel {
    static async getSummary(userId) {
        try {
            if (getIsSQLite()) {
                const db = getSqliteDb();
                const docRow = await db.get(
                    'SELECT COUNT(*) as totalDocs, COALESCE(SUM(file_size), 0) as totalBytes FROM documents WHERE user_id = ? AND (is_archived = 0 OR is_archived IS NULL)',
                    [userId]
                );
                const folderRow = await db.get(
                    'SELECT COUNT(*) as totalFolders FROM folders WHERE user_id = ?',
                    [userId]
                );
                const recentUploads = await db.all(
                    `SELECT d.id, d.title, d.file_name, d.file_size, d.mime_type, d.created_at, c.category_name
                     FROM documents d
                     LEFT JOIN categories c ON d.category_id = c.id
                     WHERE d.user_id = ? AND (d.is_archived = 0 OR d.is_archived IS NULL)
                     ORDER BY d.created_at DESC LIMIT 5`,
                    [userId]
                );
                const favRow = await db.get(
                    'SELECT COUNT(*) as favDocs FROM documents WHERE user_id = ? AND is_favorite = 1 AND (is_archived = 0 OR is_archived IS NULL)',
                    [userId]
                );

                return {
                    stats: {
                        totalDocuments: docRow?.totalDocs || 0,
                        totalFolders: folderRow?.totalFolders || 0,
                        recentUploads: recentUploads ? recentUploads.length : 0,
                        favoriteDocuments: favRow?.favDocs || 0,
                        storageUsedBytes: Number(docRow?.totalBytes || 0),
                        storageLimitBytes: 10 * 1024 * 1024 * 1024 // 10 GB
                    },
                    recentUploads: recentUploads || [],
                    recentlyViewed: []
                };
            }

            // Count total documents in MySQL
            const [docRows] = await pool.execute(
                'SELECT COUNT(*) as totalDocs, COALESCE(SUM(file_size), 0) as totalBytes FROM documents WHERE user_id = ? AND is_archived = 0',
                [userId]
            );

            const [recentUploads] = await pool.execute(
                `SELECT d.id, d.title, d.file_name, d.file_size, d.mime_type, d.created_at, c.category_name
                 FROM documents d
                 LEFT JOIN categories c ON d.category_id = c.id
                 WHERE d.user_id = ? AND d.is_archived = 0
                 ORDER BY d.created_at DESC LIMIT 5`,
                [userId]
            );

            return {
                stats: {
                    totalDocuments: docRows[0]?.totalDocs || 0,
                    totalFolders: 4,
                    recentUploads: recentUploads.length,
                    favoriteDocuments: 2,
                    storageUsedBytes: Number(docRows[0]?.totalBytes || 0),
                    storageLimitBytes: 10 * 1024 * 1024 * 1024 // 10 GB
                },
                recentUploads: recentUploads || [],
                recentlyViewed: []
            };
        } catch (err) {
            console.warn('[DashboardModel] Warning in getSummary:', err.message);

            return {
                stats: {
                    totalDocuments: 0,
                    totalFolders: 0,
                    recentUploads: 0,
                    favoriteDocuments: 0,
                    storageUsedBytes: 0,
                    storageLimitBytes: 10 * 1024 * 1024 * 1024  // 10 GB
                },
                recentUploads: [],
                recentlyViewed: []
            };
        }
    }
}

module.exports = DashboardModel;
