const { pool } = require('../config/db');

// Memory store fallback
let memoryFolders = [
    { id: 1, user_id: 1, folder_name: 'Important Tax Receipts', description: 'Tax returns and payment proofs for fiscal year 2025-2026', color: '#EF4444', icon_name: 'Folder', created_at: new Date('2026-01-10').toISOString(), updated_at: new Date('2026-01-10').toISOString() },
    { id: 2, user_id: 1, folder_name: 'University Degree Transcripts', description: 'Certified academic marks, semester transcripts & graduation proof', color: '#10B981', icon_name: 'GraduationCap', created_at: new Date('2026-01-12').toISOString(), updated_at: new Date('2026-01-12').toISOString() },
    { id: 3, user_id: 1, folder_name: 'System Architecture Diagrams', description: 'Client project specs, diagrams and scope documents', color: '#8B5CF6', icon_name: 'FolderGit2', created_at: new Date('2026-01-15').toISOString(), updated_at: new Date('2026-01-15').toISOString() },
    { id: 4, user_id: 1, folder_name: 'Passport & Identity Verification', description: 'National passport, driver license and identity proofs', color: '#3B82F6', icon_name: 'UserCheck', created_at: new Date('2026-01-18').toISOString(), updated_at: new Date('2026-01-18').toISOString() }
];
// No longer use a static hardcoded memoryDocCounts.
// Counts are computed live from DocumentModel's memory store.
let nextFolderId = 10;

// Helper: live count of non-archived documents for a folder from memory store
function getLiveDocCount(folderId, userId) {
    try {
        const DocumentModel = require('./documentModel');
        const docs = DocumentModel.getMemoryDocuments ? DocumentModel.getMemoryDocuments() : [];
        return docs.filter(d => d.folder_id === Number(folderId) && d.user_id === Number(userId) && !d.is_archived).length;
    } catch (e) {
        return 0;
    }
}

class FolderModel {
    /**
     * Get all folders for a user with document count
     */
    static async getAllByUserId(userId) {
        try {
            const query = `
                SELECT 
                    f.id,
                    f.user_id,
                    f.folder_name,
                    f.description,
                    f.color,
                    f.icon_name,
                    f.created_at,
                    f.updated_at,
                    COUNT(d.id) AS document_count
                FROM folders f
                LEFT JOIN documents d ON f.id = d.folder_id AND d.is_archived = 0
                WHERE f.user_id = ?
                GROUP BY f.id, f.user_id, f.folder_name, f.description, f.color, f.icon_name, f.created_at, f.updated_at
                ORDER BY f.created_at DESC
            `;
            const [rows] = await pool.execute(query, [userId]);
            return rows.map(r => ({
                ...r,
                document_count: Number(r.document_count || 0)
            }));
        } catch (err) {
            console.warn('[FolderModel] MySQL query failed, using memory store fallback:', err.message);
            return memoryFolders
                .filter(f => f.user_id === Number(userId))
                .map(f => ({
                    ...f,
                    document_count: getLiveDocCount(f.id, userId)
                }));
        }
    }

    /**
     * Find folder by ID
     */
    static async findById(id, userId) {
        try {
            const query = `
                SELECT f.*, COUNT(d.id) as document_count
                FROM folders f
                LEFT JOIN documents d ON f.id = d.folder_id AND d.is_archived = 0
                WHERE f.id = ? AND f.user_id = ?
                GROUP BY f.id
            `;
            const [rows] = await pool.execute(query, [id, userId]);
            if (rows.length === 0) return null;
            return {
                ...rows[0],
                document_count: Number(rows[0].document_count || 0)
            };
        } catch (err) {
            const folder = memoryFolders.find(f => f.id === Number(id) && f.user_id === Number(userId));
            if (!folder) return null;
            return {
                ...folder,
                document_count: getLiveDocCount(folder.id, userId)
            };
        }
    }

    /**
     * Create new folder
     */
    static async create({ userId, folder_name, description, color, icon_name }) {
        const folderColor = color || '#3B82F6';
        const folderIcon = icon_name || 'Folder';
        const folderDesc = description || '';
        const numUserId = Number(userId);

        const newFolderObj = {
            id: nextFolderId++,
            user_id: numUserId,
            folder_name: folder_name.trim(),
            description: folderDesc,
            color: folderColor,
            icon_name: folderIcon,
            document_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const [result] = await pool.execute(
                `INSERT INTO folders (user_id, folder_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?)`,
                [numUserId, folder_name.trim(), folderDesc, folderColor, folderIcon]
            );
            if (result && result.insertId) {
                newFolderObj.id = result.insertId;
            }
        } catch (err) {
            console.warn('[FolderModel] DB Insert failed, using memory store fallback:', err.message);
        }

        memoryFolders.unshift(newFolderObj);
        memoryDocCounts[newFolderObj.id] = 0;
        return newFolderObj;
    }

    /**
     * Update folder
     */
    static async update(id, userId, { folder_name, description, color, icon_name }) {
        const folderId = Number(id);
        const numUserId = Number(userId);

        try {
            const updates = [];
            const values = [];

            if (folder_name !== undefined) {
                updates.push('folder_name = ?');
                values.push(folder_name.trim());
            }
            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description);
            }
            if (color !== undefined) {
                updates.push('color = ?');
                values.push(color);
            }
            if (icon_name !== undefined) {
                updates.push('icon_name = ?');
                values.push(icon_name);
            }

            if (updates.length > 0) {
                values.push(folderId, numUserId);
                const sql = `UPDATE folders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
                await pool.execute(sql, values);
            }
        } catch (err) {
            console.warn('[FolderModel] DB Update failed, updating memory fallback:', err.message);
        }

        const idx = memoryFolders.findIndex(f => f.id === folderId && f.user_id === numUserId);
        if (idx !== -1) {
            if (folder_name !== undefined) memoryFolders[idx].folder_name = folder_name.trim();
            if (description !== undefined) memoryFolders[idx].description = description;
            if (color !== undefined) memoryFolders[idx].color = color;
            if (icon_name !== undefined) memoryFolders[idx].icon_name = icon_name;
            memoryFolders[idx].updated_at = new Date().toISOString();
            return {
                ...memoryFolders[idx],
                document_count: getLiveDocCount(memoryFolders[idx].id, numUserId)
            };
        }

        return await this.findById(folderId, numUserId);
    }

    /**
     * Delete folder
     */
    static async delete(id, userId) {
        const folderId = Number(id);
        const numUserId = Number(userId);

        try {
            await pool.execute(`DELETE FROM folders WHERE id = ? AND user_id = ?`, [folderId, numUserId]);
        } catch (err) {
            console.warn('[FolderModel] DB Delete failed, clearing memory fallback:', err.message);
        }

        const idx = memoryFolders.findIndex(f => f.id === folderId && f.user_id === numUserId);
        if (idx !== -1) {
            memoryFolders.splice(idx, 1);
            delete memoryDocCounts[folderId];
        }

        return { success: true, message: 'Folder deleted successfully.' };
    }
}

module.exports = FolderModel;
