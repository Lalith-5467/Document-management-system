const { pool, getIsSQLite, getSqliteDb } = require('../config/db');

// Memory store fallback
let memoryFolders = [
    { id: 1, user_id: 1, folder_name: 'Resume', description: 'Career resumes, CVs, and professional portfolios', color: '#F59E0B', icon_name: 'FileText', created_at: new Date('2026-01-10').toISOString(), updated_at: new Date('2026-01-10').toISOString() },
    { id: 2, user_id: 1, folder_name: 'Personal', description: 'Identity proofs, licences, passports, and personal records', color: '#3B82F6', icon_name: 'UserCheck', created_at: new Date('2026-01-12').toISOString(), updated_at: new Date('2026-01-12').toISOString() },
    { id: 3, user_id: 1, folder_name: 'Academic', description: 'Degrees, semester marks, transcripts, and diplomas', color: '#10B981', icon_name: 'GraduationCap', created_at: new Date('2026-01-15').toISOString(), updated_at: new Date('2026-01-15').toISOString() },
    { id: 4, user_id: 1, folder_name: 'Projects', description: 'Project architecture, code documentation, and specifications', color: '#8B5CF6', icon_name: 'FolderGit2', created_at: new Date('2026-01-18').toISOString(), updated_at: new Date('2026-01-18').toISOString() },
    { id: 5, user_id: 1, folder_name: 'Financial', description: 'Tax returns, invoices, bills, and payment receipts', color: '#06B6D4', icon_name: 'Briefcase', created_at: new Date('2026-01-20').toISOString(), updated_at: new Date('2026-01-20').toISOString() }
];
let nextFolderId = 50;

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
     * Ensure a user has default starter folders in the database
     */
    static async ensureStarterFolders(userId) {
        const numUserId = Number(userId);
        if (!numUserId) return;

        try {
            const isSqlite = getIsSQLite ? getIsSQLite() : false;
            const db = getSqliteDb ? getSqliteDb() : null;

            let existingCount = 0;
            if (isSqlite && db) {
                const row = await db.get('SELECT COUNT(*) as count FROM folders WHERE user_id = ?', [numUserId]);
                existingCount = row?.count || 0;
            } else {
                const [rows] = await pool.execute('SELECT COUNT(*) as count FROM folders WHERE user_id = ?', [numUserId]);
                existingCount = rows[0]?.count || 0;
            }

            if (existingCount === 0) {
                const defaultStarterFolders = [
                    { name: 'Resume', desc: 'Career resumes, CVs, and professional portfolios', color: '#F59E0B', icon: 'FileText' },
                    { name: 'Personal', desc: 'Identity proofs, licences, passports, and personal records', color: '#3B82F6', icon_name: 'UserCheck' },
                    { name: 'Academic', desc: 'Degrees, semester marks, transcripts, and diplomas', color: '#10B981', icon: 'GraduationCap' },
                    { name: 'Projects', desc: 'Project architecture, code documentation, and specifications', color: '#8B5CF6', icon: 'FolderGit2' },
                    { name: 'Financial', desc: 'Tax returns, invoices, bills, and payment receipts', color: '#06B6D4', icon: 'Briefcase' }
                ];

                const createdFolderMap = {};

                for (const f of defaultStarterFolders) {
                    if (isSqlite && db) {
                        const res = await db.run(
                            `INSERT INTO folders (user_id, folder_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?)`,
                            [numUserId, f.name, f.desc, f.color, f.icon]
                        );
                        createdFolderMap[f.name.toLowerCase()] = res.lastID;
                    } else {
                        const [res] = await pool.execute(
                            `INSERT INTO folders (user_id, folder_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?)`,
                            [numUserId, f.name, f.desc, f.color, f.icon]
                        );
                        if (res && res.insertId) {
                            createdFolderMap[f.name.toLowerCase()] = res.insertId;
                        }
                    }
                }

                // If user has existing documents, link them to the newly created starter folders
                if (isSqlite && db) {
                    const userDocs = await db.all('SELECT id, title, file_name, category_id, folder_id FROM documents WHERE user_id = ?', [numUserId]);
                    for (const doc of userDocs) {
                        const titleLower = ((doc.title || '') + ' ' + (doc.file_name || '')).toLowerCase();
                        let targetFolderId = null;
                        if (titleLower.includes('resume') || titleLower.includes('cv') || doc.category_id === 5 || doc.folder_id === 14 || doc.folder_id === 1) {
                            targetFolderId = createdFolderMap['resume'];
                        } else if (titleLower.includes('passport') || titleLower.includes('licence') || titleLower.includes('license') || titleLower.includes('id') || doc.category_id === 1 || doc.folder_id === 17 || doc.folder_id === 2) {
                            targetFolderId = createdFolderMap['personal'];
                        } else if (titleLower.includes('degree') || titleLower.includes('transcript') || titleLower.includes('academic') || doc.category_id === 2) {
                            targetFolderId = createdFolderMap['academic'];
                        } else if (titleLower.includes('project') || titleLower.includes('tech') || titleLower.includes('spec') || doc.category_id === 3) {
                            targetFolderId = createdFolderMap['projects'];
                        } else if (titleLower.includes('tax') || titleLower.includes('bill') || titleLower.includes('invoice') || doc.category_id === 7) {
                            targetFolderId = createdFolderMap['financial'];
                        }

                        if (targetFolderId) {
                            await db.run('UPDATE documents SET folder_id = ? WHERE id = ?', [targetFolderId, doc.id]);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('[FolderModel] Error ensuring starter folders:', e.message);
        }
    }

    /**
     * Get all folders for a user with document count
     */
    static async getAllByUserId(userId) {
        const numUserId = Number(userId);
        if (!numUserId) return [];

        await this.ensureStarterFolders(numUserId);

        try {
            const isSqlite = getIsSQLite ? getIsSQLite() : false;
            const db = getSqliteDb ? getSqliteDb() : null;

            if (isSqlite && db) {
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
                        (SELECT COUNT(*) FROM documents d WHERE d.folder_id = f.id AND (d.is_archived = 0 OR d.is_archived IS NULL)) AS document_count
                    FROM folders f
                    WHERE f.user_id = ?
                    ORDER BY f.id ASC
                `;
                const rows = await db.all(query, [numUserId]);
                return rows.map(r => ({
                    ...r,
                    document_count: Number(r.document_count || 0)
                }));
            }

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
                LEFT JOIN documents d ON f.id = d.folder_id AND (d.is_archived = 0 OR d.is_archived IS NULL)
                WHERE f.user_id = ?
                GROUP BY f.id, f.user_id, f.folder_name, f.description, f.color, f.icon_name, f.created_at, f.updated_at
                ORDER BY f.id ASC
            `;
            const [rows] = await pool.execute(query, [numUserId]);
            return rows.map(r => ({
                ...r,
                document_count: Number(r.document_count || 0)
            }));
        } catch (err) {
            console.warn('[FolderModel] query failed, using memory store fallback:', err.message);
            return memoryFolders
                .filter(f => f.user_id === numUserId)
                .map(f => ({
                    ...f,
                    document_count: getLiveDocCount(f.id, numUserId)
                }));
        }
    }

    /**
     * Find folder by ID
     */
    static async findById(id, userId) {
        const folderId = Number(id);
        const numUserId = Number(userId);

        try {
            const isSqlite = getIsSQLite ? getIsSQLite() : false;
            const db = getSqliteDb ? getSqliteDb() : null;

            if (isSqlite && db) {
                const query = `
                    SELECT 
                        f.*,
                        (SELECT COUNT(*) FROM documents d WHERE d.folder_id = f.id AND (d.is_archived = 0 OR d.is_archived IS NULL)) AS document_count
                    FROM folders f
                    WHERE f.id = ? AND f.user_id = ?
                `;
                const row = await db.get(query, [folderId, numUserId]);
                if (!row) return null;
                return {
                    ...row,
                    document_count: Number(row.document_count || 0)
                };
            }

            const query = `
                SELECT f.*, COUNT(d.id) as document_count
                FROM folders f
                LEFT JOIN documents d ON f.id = d.folder_id AND (d.is_archived = 0 OR d.is_archived IS NULL)
                WHERE f.id = ? AND f.user_id = ?
                GROUP BY f.id
            `;
            const [rows] = await pool.execute(query, [folderId, numUserId]);
            if (rows.length === 0) return null;
            return {
                ...rows[0],
                document_count: Number(rows[0].document_count || 0)
            };
        } catch (err) {
            const folder = memoryFolders.find(f => f.id === folderId && f.user_id === numUserId);
            if (!folder) return null;
            return {
                ...folder,
                document_count: getLiveDocCount(folder.id, numUserId)
            };
        }
    }

    /**
     * Create new folder
     */
    static async create({ userId, folder_name, description, color, icon_name }) {
        const folderColor = color || 'var(--theme-primary, #FF6B00)';
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
            const isSqlite = getIsSQLite ? getIsSQLite() : false;
            const db = getSqliteDb ? getSqliteDb() : null;

            if (isSqlite && db) {
                const res = await db.run(
                    `INSERT INTO folders (user_id, folder_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?)`,
                    [numUserId, folder_name.trim(), folderDesc, folderColor, folderIcon]
                );
                newFolderObj.id = res.lastID;
            } else {
                const [result] = await pool.execute(
                    `INSERT INTO folders (user_id, folder_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?)`,
                    [numUserId, folder_name.trim(), folderDesc, folderColor, folderIcon]
                );
                if (result && result.insertId) {
                    newFolderObj.id = result.insertId;
                }
            }
        } catch (err) {
            console.warn('[FolderModel] DB Insert failed, using memory store fallback:', err.message);
        }

        memoryFolders.unshift(newFolderObj);
        return newFolderObj;
    }

    /**
     * Update folder
     */
    static async update(id, userId, { folder_name, description, color, icon_name }) {
        const folderId = Number(id);
        const numUserId = Number(userId);

        try {
            const isSqlite = getIsSQLite ? getIsSQLite() : false;
            const db = getSqliteDb ? getSqliteDb() : null;

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
                if (isSqlite && db) {
                    await db.run(sql, values);
                } else {
                    await pool.execute(sql, values);
                }
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
            const isSqlite = getIsSQLite ? getIsSQLite() : false;
            const db = getSqliteDb ? getSqliteDb() : null;

            // Unlink documents from this folder before deleting
            if (isSqlite && db) {
                await db.run('UPDATE documents SET folder_id = NULL WHERE folder_id = ? AND user_id = ?', [folderId, numUserId]);
                await db.run('DELETE FROM folders WHERE id = ? AND user_id = ?', [folderId, numUserId]);
            } else {
                await pool.execute('UPDATE documents SET folder_id = NULL WHERE folder_id = ? AND user_id = ?', [folderId, numUserId]);
                await pool.execute('DELETE FROM folders WHERE id = ? AND user_id = ?', [folderId, numUserId]);
            }
        } catch (err) {
            console.warn('[FolderModel] DB Delete failed, clearing memory fallback:', err.message);
        }

        const idx = memoryFolders.findIndex(f => f.id === folderId && f.user_id === numUserId);
        if (idx !== -1) {
            memoryFolders.splice(idx, 1);
        }

        return { success: true, message: 'Folder deleted successfully.' };
    }
}

module.exports = FolderModel;
