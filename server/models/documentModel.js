const { pool } = require('../config/db');
const CategoryModel = require('./categoryModel');
const ActivityModel = require('./activityModel');
const path = require('path');
const fs = require('fs');

let memoryDocuments = [
    { id: 101, user_id: 1, category_id: 2, folder_id: 2, title: 'University_Degree_Certificate.pdf', description: 'Official bachelor degree certificate', file_name: 'University_Degree_Certificate.pdf', file_path: 'uploads/academic/University_Degree_Certificate.pdf', file_size: 2450000, mime_type: 'application/pdf', is_favorite: 1, is_archived: 0, expiry_date: null, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), updated_at: new Date(Date.now() - 3600000 * 2).toISOString(), category_name: 'Academic Documents', color: '#10B981', icon_name: 'GraduationCap' },
    { id: 102, user_id: 1, category_id: 5, folder_id: null, title: 'Senior_Software_Engineer_Resume.pdf', description: 'Updated CV 2026 version', file_name: 'Senior_Software_Engineer_Resume.pdf', file_path: 'uploads/personal/Senior_Software_Engineer_Resume.pdf', file_size: 1120000, mime_type: 'application/pdf', is_favorite: 1, is_archived: 0, expiry_date: null, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), updated_at: new Date(Date.now() - 3600000 * 5).toISOString(), category_name: 'Resume', color: '#F59E0B', icon_name: 'FileText' },
    { id: 103, user_id: 1, category_id: 1, folder_id: 4, title: 'National_Passport_Copy.pdf', description: 'Passport front and back scan', file_name: 'National_Passport_Copy.pdf', file_path: 'uploads/personal/National_Passport_Copy.pdf', file_size: 3400000, mime_type: 'application/pdf', is_favorite: 0, is_archived: 0, expiry_date: '2027-01-15', created_at: new Date(Date.now() - 3600000 * 24).toISOString(), updated_at: new Date(Date.now() - 3600000 * 24).toISOString(), category_name: 'Personal Documents', color: '#3B82F6', icon_name: 'UserCheck' },
    { id: 104, user_id: 1, category_id: 6, folder_id: 3, title: 'System_Architecture_BRD_v2.docx', description: 'Client project business requirement doc', file_name: 'System_Architecture_BRD_v2.docx', file_path: 'uploads/client-documents/System_Architecture_BRD_v2.docx', file_size: 4800000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', is_favorite: 1, is_archived: 0, expiry_date: null, created_at: new Date(Date.now() - 3600000 * 48).toISOString(), updated_at: new Date(Date.now() - 3600000 * 48).toISOString(), category_name: 'Client Requirement Documents', color: '#06B6D4', icon_name: 'Briefcase' },
    { id: 105, user_id: 1, category_id: 4, folder_id: null, title: 'AWS_Solutions_Architect_Certificate.png', description: 'AWS certification badge image', file_name: 'AWS_Solutions_Architect_Certificate.png', file_path: 'uploads/certificates/AWS_Solutions_Architect_Certificate.png', file_size: 1850000, mime_type: 'image/png', is_favorite: 0, is_archived: 0, expiry_date: '2026-08-30', created_at: new Date(Date.now() - 3600000 * 72).toISOString(), updated_at: new Date(Date.now() - 3600000 * 72).toISOString(), category_name: 'Certificates', color: '#EC4899', icon_name: 'Award' }
];
let nextDocId = 200;

class DocumentModel {
    /**
     * Expose in-memory documents array for cross-model live counting (e.g. folder doc counts)
     */
    static getMemoryDocuments() {
        return memoryDocuments;
    }

    /**
     * Get categories list for selection
     */
    static async getCategories(userId = 1) {
        return await CategoryModel.getAllByUserId(userId);
    }

    /**
     * Get dashboard summary stats
     */
    static async getStatsByUserId(userId) {
        try {
            const numUserId = Number(userId);
            const FolderModel = require('./folderModel');
            if (FolderModel && FolderModel.ensureStarterFolders && numUserId) {
                await FolderModel.ensureStarterFolders(numUserId);
            }

            const [rows] = await pool.execute(
                `SELECT 
                    COUNT(*) as totalDocs,
                    COALESCE(SUM(file_size), 0) as totalBytes,
                    SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favoriteDocs,
                    SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archivedDocs
                FROM documents WHERE user_id = ? AND (is_archived = 0 OR is_archived IS NULL)`,
                [numUserId]
            );

            const [catRows] = await pool.execute(
                `SELECT COUNT(*) as catCount FROM categories WHERE user_id = ? OR user_id IS NULL`,
                [numUserId]
            );

            const [folderRows] = await pool.execute(
                `SELECT COUNT(*) as folderCount FROM folders WHERE user_id = ?`,
                [numUserId]
            );

            return {
                totalDocuments: Number(rows[0]?.totalDocs || 0),
                totalFolders: Number(folderRows[0]?.folderCount || 0),
                categoriesCount: Number(catRows[0]?.catCount || 10),
                favoriteDocuments: Number(rows[0]?.favoriteDocs || 0),
                archivedDocuments: Number(rows[0]?.archivedDocs || 0),
                storageUsedBytes: Number(rows[0]?.totalBytes || 0),
                storageLimitBytes: 15 * 1024 * 1024 * 1024 // 15 GB
            };
        } catch (err) {
            const activeDocs = memoryDocuments.filter(d => d.user_id === Number(userId) && !d.is_archived);
            const totalBytes = activeDocs.reduce((acc, d) => acc + d.file_size, 0);
            const favoriteDocs = activeDocs.filter(d => d.is_favorite).length;

            return {
                totalDocuments: activeDocs.length,
                totalFolders: 4,
                categoriesCount: 8,
                favoriteDocuments: favoriteDocs,
                archivedDocuments: memoryDocuments.filter(d => d.user_id === Number(userId) && d.is_archived).length,
                storageUsedBytes: totalBytes || 13620000,
                storageLimitBytes: 15 * 1024 * 1024 * 1024
            };
        }
    }

    /**
     * Get all documents for a user with search, file_type, date_range, categories, folders, sorting and pagination
     */
    static async getAllByUserId(userId, { search, category_id, folder_id, file_type, date_range, is_favorite, is_archived = 0, sort_by = 'date_desc', page = 1, limit = 10 }) {
        try {
            const { sqliteDb } = require('../config/db');
            if (sqliteDb) {
                let sql = `
                    SELECT 
                        d.*,
                        c.category_name,
                        c.color,
                        c.icon_name,
                        f.folder_name
                    FROM documents d
                    LEFT JOIN categories c ON d.category_id = c.id
                    LEFT JOIN folders f ON d.folder_id = f.id
                    WHERE d.user_id = ? AND (d.is_archived = ? OR d.is_archived IS NULL)
                `;
                const params = [Number(userId), Number(is_archived)];

                if (search && search.trim() !== '') {
                    sql += ` AND (d.title LIKE ? OR d.description LIKE ? OR d.file_name LIKE ?)`;
                    const term = `%${search.trim()}%`;
                    params.push(term, term, term);
                }

                if (category_id) {
                    sql += ` AND d.category_id = ?`;
                    params.push(Number(category_id));
                }

                if (folder_id) {
                    sql += ` AND d.folder_id = ?`;
                    params.push(Number(folder_id));
                }

                if (is_favorite !== undefined && is_favorite !== '') {
                    sql += ` AND (d.is_favorite = ? OR d.id IN (SELECT document_id FROM favorites WHERE user_id = ?))`;
                    params.push(Number(is_favorite), Number(userId));
                }

                if (file_type) {
                    switch (file_type.toLowerCase()) {
                        case 'pdf':
                            sql += ` AND (d.mime_type LIKE '%pdf%' OR d.file_name LIKE '%.pdf' OR d.title LIKE '%.pdf')`;
                            break;
                        case 'word':
                            sql += ` AND (d.mime_type LIKE '%word%' OR d.mime_type LIKE '%wordprocessingml%' OR d.file_name LIKE '%.doc%' OR d.title LIKE '%.doc%')`;
                            break;
                        case 'excel':
                            sql += ` AND (d.mime_type LIKE '%excel%' OR d.file_name LIKE '%.xls%' OR d.title LIKE '%.xls%' OR d.mime_type LIKE '%sheet%')`;
                            break;
                        case 'image':
                            sql += ` AND (d.mime_type LIKE 'image/%' OR d.file_name LIKE '%.png' OR d.file_name LIKE '%.jpg' OR d.file_name LIKE '%.jpeg' OR d.title LIKE '%.png' OR d.title LIKE '%.jpg' OR d.title LIKE '%.jpeg')`;
                            break;
                        case 'pptx':
                        case 'presentation':
                            sql += ` AND (d.mime_type LIKE '%presentation%' OR d.mime_type LIKE '%powerpoint%' OR d.file_name LIKE '%.ppt%' OR d.title LIKE '%.ppt%')`;
                            break;
                        case 'text':
                            sql += ` AND (d.mime_type LIKE '%text%' OR d.file_name LIKE '%.txt' OR d.title LIKE '%.txt')`;
                            break;
                    }
                }

                if (date_range) {
                    const now = new Date();
                    if (date_range === 'today') {
                        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                        sql += ` AND d.created_at >= ?`;
                        params.push(todayStart);
                    } else if (date_range === '7days') {
                        const past7Days = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
                        sql += ` AND d.created_at >= ?`;
                        params.push(past7Days);
                    } else if (date_range === '30days') {
                        const past30Days = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
                        sql += ` AND d.created_at >= ?`;
                        params.push(past30Days);
                    } else if (date_range === 'year') {
                        const pastYear = new Date(now.getTime() - 365 * 24 * 3600 * 1000).toISOString();
                        sql += ` AND d.created_at >= ?`;
                        params.push(pastYear);
                    }
                }

                switch (sort_by) {
                    case 'name_asc':
                        sql += ` ORDER BY d.title ASC`;
                        break;
                    case 'name_desc':
                        sql += ` ORDER BY d.title DESC`;
                        break;
                    case 'date_asc':
                        sql += ` ORDER BY d.created_at ASC`;
                        break;
                    case 'size_desc':
                        sql += ` ORDER BY d.file_size DESC`;
                        break;
                    case 'size_asc':
                        sql += ` ORDER BY d.file_size ASC`;
                        break;
                    default:
                        sql += ` ORDER BY d.created_at DESC`;
                        break;
                }

                const sqliteRows = await sqliteDb.all(sql, params);
                // Only return SQLite results if there are actual documents; otherwise fall through to MySQL
                if (sqliteRows && sqliteRows.length > 0) {
                    return {
                        documents: sqliteRows,
                        totalCount: sqliteRows.length,
                        currentPage: 1,
                        totalPages: 1,
                        limit: 100
                    };
                }
            }

            let sql = `
                SELECT 
                    d.*,
                    c.category_name,
                    c.color,
                    c.icon_name,
                    f.folder_name
                FROM documents d
                LEFT JOIN categories c ON d.category_id = c.id
                LEFT JOIN folders f ON d.folder_id = f.id
                WHERE d.user_id = ? AND d.is_archived = ?
            `;
            const params = [userId, Number(is_archived)];

            if (search && search.trim() !== '') {
                sql += ` AND (d.title LIKE ? OR d.description LIKE ? OR d.file_name LIKE ?)`;
                const term = `%${search.trim()}%`;
                params.push(term, term, term);
            }

            if (category_id) {
                sql += ` AND d.category_id = ?`;
                params.push(Number(category_id));
            }

            if (folder_id) {
                sql += ` AND d.folder_id = ?`;
                params.push(Number(folder_id));
            }

            if (is_favorite !== undefined && is_favorite !== '') {
                sql += ` AND d.is_favorite = ?`;
                params.push(Number(is_favorite));
            }

            // File Type filter
            if (file_type) {
                switch (file_type.toLowerCase()) {
                    case 'pdf':
                        sql += ` AND (d.mime_type LIKE '%pdf%' OR d.file_name LIKE '%.pdf')`;
                        break;
                    case 'word':
                        sql += ` AND (d.mime_type LIKE '%word%' OR d.mime_type LIKE '%wordprocessingml%' OR d.file_name LIKE '%.doc%')`;
                        break;
                    case 'pptx':
                    case 'presentation':
                        sql += ` AND (d.mime_type LIKE '%presentation%' OR d.mime_type LIKE '%powerpoint%' OR d.file_name LIKE '%.ppt%')`;
                        break;
                    case 'excel':
                        sql += ` AND (d.mime_type LIKE '%excel%' OR d.file_name LIKE '%.xls%' OR d.mime_type LIKE '%sheet%')`;
                        break;
                    case 'image':
                        sql += ` AND (d.mime_type LIKE 'image/%' OR d.file_name LIKE '%.png' OR d.file_name LIKE '%.jpg' OR d.file_name LIKE '%.jpeg')`;
                        break;
                    case 'text':
                        sql += ` AND (d.mime_type LIKE '%text%' OR d.file_name LIKE '%.txt')`;
                        break;
                }
            }

            // Date Range filter
            if (date_range) {
                const now = new Date();
                if (date_range === 'today') {
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                    sql += ` AND d.created_at >= ?`;
                    params.push(todayStart);
                } else if (date_range === '7days') {
                    const past7Days = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
                    sql += ` AND d.created_at >= ?`;
                    params.push(past7Days);
                } else if (date_range === '30days') {
                    const past30Days = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
                    sql += ` AND d.created_at >= ?`;
                    params.push(past30Days);
                } else if (date_range === 'year') {
                    const pastYear = new Date(now.getTime() - 365 * 24 * 3600 * 1000).toISOString();
                    sql += ` AND d.created_at >= ?`;
                    params.push(pastYear);
                }
            }

            // Sorting clause
            switch (sort_by) {
                case 'name_asc':
                    sql += ` ORDER BY d.title ASC`;
                    break;
                case 'name_desc':
                    sql += ` ORDER BY d.title DESC`;
                    break;
                case 'date_asc':
                    sql += ` ORDER BY d.created_at ASC`;
                    break;
                case 'size_desc':
                    sql += ` ORDER BY d.file_size DESC`;
                    break;
                case 'size_asc':
                    sql += ` ORDER BY d.file_size ASC`;
                    break;
                case 'type_asc':
                    sql += ` ORDER BY d.mime_type ASC`;
                    break;
                case 'date_desc':
                default:
                    sql += ` ORDER BY d.created_at DESC`;
                    break;
            }

            const [allRows] = await pool.execute(sql, params);
            const totalCount = allRows.length;
            const pageNum = Math.max(1, Number(page) || 1);
            const limitNum = Math.max(1, Number(limit) || 10);
            const totalPages = Math.ceil(totalCount / limitNum) || 1;
            const offset = (pageNum - 1) * limitNum;

            const paginatedRows = allRows.slice(offset, offset + limitNum);

            return {
                documents: paginatedRows,
                totalCount,
                currentPage: pageNum,
                totalPages,
                limit: limitNum
            };
        } catch (err) {
            console.warn('[DocumentModel] Query failed, returning memory store fallback:', err.message);
            let filtered = memoryDocuments.filter(d => d.user_id === Number(userId) && Boolean(d.is_archived) === Boolean(Number(is_archived)));

            if (search && search.trim() !== '') {
                const term = search.toLowerCase().trim();
                filtered = filtered.filter(d => d.title.toLowerCase().includes(term) || (d.description && d.description.toLowerCase().includes(term)));
            }
            if (category_id) {
                filtered = filtered.filter(d => d.category_id === Number(category_id));
            }
            if (folder_id) {
                filtered = filtered.filter(d => d.folder_id === Number(folder_id));
            }
            if (is_favorite !== undefined && is_favorite !== '') {
                filtered = filtered.filter(d => Boolean(d.is_favorite) === Boolean(Number(is_favorite)));
            }

            // Memory sort
            filtered.sort((a, b) => {
                if (sort_by === 'name_asc') return a.title.localeCompare(b.title);
                if (sort_by === 'name_desc') return b.title.localeCompare(a.title);
                if (sort_by === 'date_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                if (sort_by === 'size_desc') return b.file_size - a.file_size;
                if (sort_by === 'size_asc') return a.file_size - b.file_size;
                if (sort_by === 'type_asc') return (a.mime_type || '').localeCompare(b.mime_type || '');
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            const totalCount = filtered.length;
            const pageNum = Math.max(1, Number(page) || 1);
            const limitNum = Math.max(1, Number(limit) || 10);
            const totalPages = Math.ceil(totalCount / limitNum) || 1;
            const offset = (pageNum - 1) * limitNum;

            return {
                documents: filtered.slice(offset, offset + limitNum),
                totalCount,
                currentPage: pageNum,
                totalPages,
                limit: limitNum
            };
        }
    }

    /**
     * Find document by ID, filename, or title
     */
    static async findById(id, userId) {
        if (!id) return null;
        try {
            const { sqliteDb } = require('../config/db');
            let sql = `
                SELECT d.*, c.category_name, c.color, c.icon_name, f.folder_name
                FROM documents d
                LEFT JOIN categories c ON d.category_id = c.id
                LEFT JOIN folders f ON d.folder_id = f.id
                WHERE (d.id = ? OR d.id = ?)
            `;
            const params = [id, String(id)];
            if (userId) {
                sql += ` AND (d.user_id = ? OR ? = 1)`;
                params.push(userId, userId);
            }
            
            if (sqliteDb) {
                let row = await sqliteDb.get(sql, params);
                if (row) return row;
                
                // If user-scoped query returned nothing, try without user filter
                if (userId) {
                    const fallbackSql = `
                        SELECT d.*, c.category_name, c.color, c.icon_name, f.folder_name
                        FROM documents d
                        LEFT JOIN categories c ON d.category_id = c.id
                        LEFT JOIN folders f ON d.folder_id = f.id
                        WHERE (d.id = ? OR d.id = ?)
                    `;
                    row = await sqliteDb.get(fallbackSql, [id, String(id)]);
                    if (row) return row;
                }

                // If not found by numeric ID, try matching by file_name or title
                const nameSql = `
                    SELECT d.*, c.category_name, c.color, c.icon_name, f.folder_name
                    FROM documents d
                    LEFT JOIN categories c ON d.category_id = c.id
                    LEFT JOIN folders f ON d.folder_id = f.id
                    WHERE (d.file_name = ? OR d.title = ? OR d.file_name LIKE ? OR d.file_path LIKE ?)
                    ORDER BY d.id DESC LIMIT 1
                `;
                row = await sqliteDb.get(nameSql, [String(id), String(id), `%${id}%`, `%${id}%`]);
                if (row) return row;
            }
            if (pool) {
                const [rows] = await pool.execute(sql, params);
                if (rows && rows[0]) return rows[0];
            }
        } catch (err) {
            console.warn('[DocumentModel] findById DB error, using memory fallback:', err.message);
        }

        const idStr = String(id).toLowerCase();
        return memoryDocuments.find(d => 
            String(d.id) === String(id) || 
            d.id == id || 
            (d.file_name && d.file_name.toLowerCase() === idStr) || 
            (d.title && d.title.toLowerCase() === idStr)
        ) || null;
    }

    /**
     * Create / Upload new document
     */
    static async create({ userId, category_id, folder_id, title, description, file_name, file_path, file_size, mime_type, is_favorite = 0, expiry_date = null }) {
        const catId = Number(category_id) || 8;
        const foldId = folder_id ? Number(folder_id) : null;
        const docTitle = title || file_name;
        const isFav = Number(is_favorite) ? 1 : 0;
        const { sqliteDb } = require('../config/db');

        const newDoc = {
            id: nextDocId++,
            user_id: Number(userId),
            category_id: catId,
            folder_id: foldId,
            title: docTitle,
            description: description || '',
            file_name,
            file_path,
            file_size,
            mime_type,
            is_favorite: isFav,
            is_archived: 0,
            expiry_date: expiry_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category_name: 'General Document',
            color: '#3B82F6',
            icon_name: 'FileText'
        };

        try {
            if (sqliteDb) {
                const res = await sqliteDb.run(
                    `INSERT INTO documents (user_id, category_id, folder_id, title, description, file_name, file_path, file_size, mime_type, is_favorite, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [Number(userId), catId, foldId, docTitle, description || '', file_name, file_path, file_size, mime_type, isFav, expiry_date]
                );
                if (res && res.lastID) {
                    newDoc.id = res.lastID;
                }
                if (isFav) {
                    await sqliteDb.run(`INSERT OR IGNORE INTO favorites (user_id, document_id) VALUES (?, ?)`, [Number(userId), newDoc.id]);
                }
            } else if (pool) {
                const [result] = await pool.execute(
                    `INSERT INTO documents (user_id, category_id, folder_id, title, description, file_name, file_path, file_size, mime_type, is_favorite, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [Number(userId), catId, foldId, docTitle, description || '', file_name, file_path, file_size, mime_type, isFav, expiry_date]
                );
                if (result && result.insertId) {
                    newDoc.id = result.insertId;
                }
                if (isFav) {
                    await pool.execute(`INSERT IGNORE INTO favorites (user_id, document_id) VALUES (?, ?)`, [Number(userId), newDoc.id]);
                }
            }

            // Log activity
            await ActivityModel.log({
                userId,
                action_type: 'UPLOAD',
                document_name: docTitle,
                details: `Uploaded file (${(file_size / 1024 / 1024).toFixed(2)} MB)${isFav ? ' (Starred as Favorite)' : ''}`
            });

            const fetched = await this.findById(newDoc.id, userId);
            if (fetched) return fetched;
        } catch (err) {
            console.warn('[DocumentModel] DB Insert failed, saving to memory store fallback:', err.message);
        }

        memoryDocuments.unshift(newDoc);
        return newDoc;
    }

    /**
     * Check if a duplicate document title exists in the same folder for the user
     */
    static async checkDuplicateTitle(userId, title, folderId = null, excludeDocId = null) {
        try {
            let sql = `SELECT id FROM documents WHERE user_id = ? AND LOWER(title) = LOWER(?) AND is_archived = 0`;
            const params = [userId, title.trim()];

            if (folderId) {
                sql += ` AND folder_id = ?`;
                params.push(Number(folderId));
            } else {
                sql += ` AND folder_id IS NULL`;
            }

            if (excludeDocId) {
                sql += ` AND id != ?`;
                params.push(Number(excludeDocId));
            }

            const { sqliteDb } = require('../config/db');
            
            if (sqliteDb) {
                const row = await sqliteDb.get(sql, params);
                return !!row;
            } else if (pool) {
                const [rows] = await pool.execute(sql, params);
                return rows.length > 0;
            }
            throw new Error("No database connection");
        } catch (err) {
            return memoryDocuments.some(d =>
                d.user_id === Number(userId) &&
                d.title.toLowerCase() === title.toLowerCase().trim() &&
                !d.is_archived &&
                (folderId ? d.folder_id === Number(folderId) : !d.folder_id) &&
                (!excludeDocId || d.id !== Number(excludeDocId))
            );
        }
    }

    /**
     * Rename document title without changing file asset
     */
    static async rename(id, userId, newTitle) {
        try {
            const { sqliteDb } = require('../config/db');
            const sql = `UPDATE documents SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
            
            if (sqliteDb) {
                await sqliteDb.run(sql, [newTitle.trim(), id, userId]);
            } else if (pool) {
                await pool.execute(sql, [newTitle.trim(), id, userId]);
            } else {
                throw new Error("No db connection");
            }

            await ActivityModel.log({
                userId,
                action_type: 'RENAME',
                document_name: newTitle.trim(),
                details: `Renamed document to "${newTitle.trim()}"`
            });

            return await this.findById(id, userId);
        } catch (err) {
            const idx = memoryDocuments.findIndex(d => d.id === Number(id) && d.user_id === Number(userId));
            if (idx !== -1) {
                memoryDocuments[idx].title = newTitle.trim();
                memoryDocuments[idx].updated_at = new Date().toISOString();
                return memoryDocuments[idx];
            }
            return null;
        }
    }

    /**
     * Move document to a different folder
     */
    static async move(id, userId, newFolderId) {
        try {
            const { sqliteDb } = require('../config/db');
            const targetFolderId = newFolderId ? Number(newFolderId) : null;
            const sql = `UPDATE documents SET folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
            
            if (sqliteDb) {
                await sqliteDb.run(sql, [targetFolderId, id, userId]);
            } else if (pool) {
                await pool.execute(sql, [targetFolderId, id, userId]);
            } else {
                throw new Error("No db connection");
            }

            await ActivityModel.log({
                userId,
                action_type: 'MOVE',
                document_name: null,
                details: `Moved document to ${targetFolderId ? `folder ID ${targetFolderId}` : 'Root Vault'}`
            });

            return await this.findById(id, userId);
        } catch (err) {
            const idx = memoryDocuments.findIndex(d => d.id === Number(id) && d.user_id === Number(userId));
            if (idx !== -1) {
                memoryDocuments[idx].folder_id = newFolderId ? Number(newFolderId) : null;
                memoryDocuments[idx].updated_at = new Date().toISOString();
                return memoryDocuments[idx];
            }
            return null;
        }
    }

    /**
     * Update document details (title, description, category_id, folder_id, tags)
     */
    static async update(id, userId, { title, description, category_id, folder_id, tags, expiry_date }) {
        try {
            const updates = ['updated_at = CURRENT_TIMESTAMP'];
            const values = [];

            if (title !== undefined) {
                updates.push('title = ?');
                values.push(title.trim());
            }
            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description);
            }
            if (category_id !== undefined) {
                updates.push('category_id = ?');
                values.push(Number(category_id));
            }
            if (folder_id !== undefined) {
                updates.push('folder_id = ?');
                values.push(folder_id ? Number(folder_id) : null);
            }
            if (tags !== undefined) {
                updates.push('tags = ?');
                values.push(tags);
            }
            if (expiry_date !== undefined) {
                updates.push('expiry_date = ?');
                values.push(expiry_date || null);
            }

            values.push(id, userId);
            const sql = `UPDATE documents SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
            const { sqliteDb } = require('../config/db');
            
            if (sqliteDb) {
                await sqliteDb.run(sql, values);
            } else if (pool) {
                await pool.execute(sql, values);
            } else {
                throw new Error("No db connection");
            }

            await ActivityModel.log({
                userId,
                action_type: 'EDIT',
                document_name: title,
                details: 'Updated document details and metadata'
            });

            return await this.findById(id, userId);
        } catch (err) {
            const idx = memoryDocuments.findIndex(d => d.id === Number(id) && d.user_id === Number(userId));
            if (idx !== -1) {
                if (title !== undefined) memoryDocuments[idx].title = title.trim();
                if (description !== undefined) memoryDocuments[idx].description = description;
                if (category_id !== undefined) memoryDocuments[idx].category_id = Number(category_id);
                if (folder_id !== undefined) memoryDocuments[idx].folder_id = folder_id ? Number(folder_id) : null;
                if (tags !== undefined) memoryDocuments[idx].tags = tags;
                if (expiry_date !== undefined) memoryDocuments[idx].expiry_date = expiry_date || null;
                memoryDocuments[idx].updated_at = new Date().toISOString();
                return memoryDocuments[idx];
            }
            return null;
        }
    }

    /**
     * Toggle Favorite status
     */
    static async toggleFavorite(id, userId, overrideState) {
        const numId = Number(id);
        const numUserId = Number(userId);
        const { sqliteDb } = require('../config/db');

        let newFav = overrideState !== undefined ? (overrideState ? 1 : 0) : 1;

        try {
            if (sqliteDb) {
                if (overrideState === undefined) {
                    const existing = await sqliteDb.get(`SELECT is_favorite FROM documents WHERE id = ? AND user_id = ?`, [numId, numUserId]);
                    newFav = (existing && existing.is_favorite) ? 0 : 1;
                }
                await sqliteDb.run(`UPDATE documents SET is_favorite = ? WHERE id = ? AND user_id = ?`, [newFav, numId, numUserId]);
                if (newFav === 1) {
                    await sqliteDb.run(`INSERT OR IGNORE INTO favorites (user_id, document_id) VALUES (?, ?)`, [numUserId, numId]);
                } else {
                    await sqliteDb.run(`DELETE FROM favorites WHERE user_id = ? AND document_id = ?`, [numUserId, numId]);
                }
            } else if (pool) {
                if (overrideState === undefined) {
                    const [rows] = await pool.execute(`SELECT is_favorite FROM documents WHERE id = ? AND user_id = ?`, [numId, numUserId]);
                    newFav = (rows[0] && rows[0].is_favorite) ? 0 : 1;
                }
                await pool.execute(`UPDATE documents SET is_favorite = ? WHERE id = ? AND user_id = ?`, [newFav, numId, numUserId]);
                if (newFav === 1) {
                    await pool.execute(`INSERT IGNORE INTO favorites (user_id, document_id) VALUES (?, ?)`, [numUserId, numId]);
                } else {
                    await pool.execute(`DELETE FROM favorites WHERE user_id = ? AND document_id = ?`, [numUserId, numId]);
                }
            }
        } catch (err) {
            console.warn('[DocumentModel] toggleFavorite DB error:', err.message);
        }

        const idx = memoryDocuments.findIndex(d => d.id === numId);
        if (idx !== -1) {
            memoryDocuments[idx].is_favorite = newFav;
        }

        return { id: numId, user_id: numUserId, is_favorite: newFav };
    }

    /**
     * Soft Delete Document (moves to Recycle Bin)
     */
    static async softDelete(id, userId) {
        const numId = Number(id);
        const numUserId = Number(userId);
        const { sqliteDb } = require('../config/db');
        const nowIso = new Date().toISOString();

        const doc = await this.findById(numId, numUserId);
        if (!doc) return { success: false, message: 'Document not found or unauthorized.' };

        try {
            if (sqliteDb) {
                await sqliteDb.run(
                    `UPDATE documents SET is_archived = 1, deleted_at = ? WHERE id = ? AND user_id = ?`,
                    [nowIso, numId, numUserId]
                );
            } else if (pool) {
                await pool.execute(
                    `UPDATE documents SET is_archived = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
                    [numId, numUserId]
                );
            }

            await ActivityModel.log({
                userId: numUserId,
                action_type: 'TRASH',
                document_name: doc.title,
                details: `Moved document "${doc.title}" to Recycle Bin`
            });
        } catch (err) {
            console.warn('[DocumentModel] softDelete DB error:', err.message);
        }

        const idx = memoryDocuments.findIndex(d => d.id === numId && d.user_id === numUserId);
        if (idx !== -1) {
            memoryDocuments[idx].is_archived = 1;
            memoryDocuments[idx].deleted_at = nowIso;
        }

        return { success: true, message: 'Document moved to Recycle Bin successfully.' };
    }

    /**
     * Restore Document from Recycle Bin
     */
    static async restore(id, userId) {
        const numId = Number(id);
        const numUserId = Number(userId);
        const { sqliteDb } = require('../config/db');

        const doc = await this.findById(numId, numUserId);
        if (!doc) return { success: false, message: 'Document not found in Recycle Bin.' };

        try {
            if (sqliteDb) {
                await sqliteDb.run(
                    `UPDATE documents SET is_archived = 0, deleted_at = NULL WHERE id = ? AND user_id = ?`,
                    [numId, numUserId]
                );
            } else if (pool) {
                await pool.execute(
                    `UPDATE documents SET is_archived = 0, deleted_at = NULL WHERE id = ? AND user_id = ?`,
                    [numId, numUserId]
                );
            }

            await ActivityModel.log({
                userId: numUserId,
                action_type: 'RESTORE',
                document_name: doc.title,
                details: `Restored document "${doc.title}" from Recycle Bin to original folder`
            });
        } catch (err) {
            console.warn('[DocumentModel] restore DB error:', err.message);
        }

        const idx = memoryDocuments.findIndex(d => d.id === numId && d.user_id === numUserId);
        if (idx !== -1) {
            memoryDocuments[idx].is_archived = 0;
            memoryDocuments[idx].deleted_at = null;
        }

        return { success: true, message: 'Document restored successfully to My Documents.' };
    }

    /**
     * Get all Recycle Bin / Trashed documents for a user
     */
    static async getTrashByUserId(userId) {
        const numUserId = Number(userId);
        const { sqliteDb } = require('../config/db');

        try {
            if (sqliteDb) {
                const rows = await sqliteDb.all(
                    `SELECT d.*, c.category_name, c.color as category_color, f.folder_name
                     FROM documents d
                     LEFT JOIN categories c ON d.category_id = c.id
                     LEFT JOIN folders f ON d.folder_id = f.id
                     WHERE d.user_id = ? AND d.is_archived = 1
                     ORDER BY d.deleted_at DESC, d.updated_at DESC`,
                    [numUserId]
                );
                if (rows) return rows;
            } else if (pool) {
                const [rows] = await pool.execute(
                    `SELECT d.*, c.category_name, c.color as category_color, f.folder_name
                     FROM documents d
                     LEFT JOIN categories c ON d.category_id = c.id
                     LEFT JOIN folders f ON d.folder_id = f.id
                     WHERE d.user_id = ? AND d.is_archived = 1
                     ORDER BY d.deleted_at DESC, d.updated_at DESC`,
                    [numUserId]
                );
                if (rows) return rows;
            }
        } catch (err) {
            console.warn('[DocumentModel] getTrashByUserId DB error:', err.message);
        }

        return memoryDocuments.filter(d => d.user_id === numUserId && Boolean(d.is_archived));
    }

    /**
     * Permanent Delete single document record and physical file asset
     */
    static async permanentDelete(id, userId) {
        const numId = Number(id);
        const numUserId = Number(userId);
        const { sqliteDb } = require('../config/db');

        const doc = await this.findById(numId, numUserId);
        if (!doc) return { success: false, message: 'Document not found or unauthorized.' };

        // Attempt physical file deletion from disk
        if (doc.file_path) {
            const possiblePaths = [
                path.resolve(__dirname, '..', doc.file_path),
                path.resolve(__dirname, '..', 'uploads', path.basename(doc.file_path))
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    try { fs.unlinkSync(p); } catch (e) {}
                }
            }
        }

        try {
            if (sqliteDb) {
                await sqliteDb.run(`DELETE FROM favorites WHERE document_id = ?`, [numId]);
                await sqliteDb.run(`DELETE FROM documents WHERE id = ? AND user_id = ?`, [numId, numUserId]);
            } else if (pool) {
                await pool.execute(`DELETE FROM favorites WHERE document_id = ?`, [numId]);
                await pool.execute(`DELETE FROM documents WHERE id = ? AND user_id = ?`, [numId, numUserId]);
            }

            await ActivityModel.log({
                userId: numUserId,
                action_type: 'PERMANENT_DELETE',
                document_name: doc.title,
                details: `Permanently deleted document "${doc.title}" and purged file asset from storage`
            });
        } catch (err) {
            console.warn('[DocumentModel] permanentDelete DB error:', err.message);
        }

        const idx = memoryDocuments.findIndex(d => d.id === numId && d.user_id === numUserId);
        if (idx !== -1) {
            memoryDocuments.splice(idx, 1);
        }

        return { success: true, message: 'Document permanently deleted from database and disk.' };
    }

    /**
     * Empty entire Recycle Bin for a user
     */
    static async emptyTrash(userId) {
        const numUserId = Number(userId);
        const { sqliteDb } = require('../config/db');

        const trashedDocs = await this.getTrashByUserId(numUserId);
        const count = trashedDocs.length;

        // Physical file cleanup
        for (const doc of trashedDocs) {
            if (doc.file_path) {
                const possiblePaths = [
                    path.resolve(__dirname, '..', doc.file_path),
                    path.resolve(__dirname, '..', 'uploads', path.basename(doc.file_path))
                ];
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        try { fs.unlinkSync(p); } catch (e) {}
                    }
                }
            }
        }

        try {
            if (sqliteDb) {
                await sqliteDb.run(`DELETE FROM documents WHERE user_id = ? AND is_archived = 1`, [numUserId]);
            } else if (pool) {
                await pool.execute(`DELETE FROM documents WHERE user_id = ? AND is_archived = 1`, [numUserId]);
            }

            await ActivityModel.log({
                userId: numUserId,
                action_type: 'EMPTY_TRASH',
                document_name: null,
                details: `Emptied Recycle Bin (${count} files permanently deleted)`
            });
        } catch (err) {
            console.warn('[DocumentModel] emptyTrash DB error:', err.message);
        }

        memoryDocuments = memoryDocuments.filter(d => !(d.user_id === numUserId && d.is_archived));

        return { success: true, message: `Recycle Bin emptied successfully (${count} files deleted).`, count };
    }

    /**
     * Legacy toggleArchive alias
     */
    static async toggleArchive(id, userId) {
        const doc = await this.findById(id, userId);
        if (!doc) return null;
        if (doc.is_archived) {
            await this.restore(id, userId);
        } else {
            await this.softDelete(id, userId);
        }
        return await this.findById(id, userId);
    }

    /**
     * Legacy delete alias (permanent delete)
     */
    static async delete(id, userId) {
        return await this.permanentDelete(id, userId);
    }
}

module.exports = DocumentModel;
