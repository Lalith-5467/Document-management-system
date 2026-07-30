const { pool } = require('../config/db');

// In-memory fallback dataset for development when MySQL server is offline
const DEFAULT_SYSTEM_CATEGORIES = [
    { id: 1, user_id: null, category_name: 'Personal Documents', description: 'IDs, Passports, Birth Certificates, Taxes', color: '#3B82F6', icon_name: 'UserCheck', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 2, user_id: null, category_name: 'Academic Documents', description: 'Degrees, Transcripts, Marksheets, Diplomas', color: '#10B981', icon_name: 'GraduationCap', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 3, user_id: null, category_name: 'Project Documents', description: 'Specifications, Code Docs, Reports, Diagrams', color: '#8B5CF6', icon_name: 'FolderGit2', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 4, user_id: null, category_name: 'Certificates', description: 'Professional certifications, Course completion proofs', color: '#EC4899', icon_name: 'Award', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 5, user_id: null, category_name: 'Resume', description: 'Resume drafts, CV versions, Cover letters, Portfolios', color: '#F59E0B', icon_name: 'FileText', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 6, user_id: null, category_name: 'Client Requirement Documents', description: 'BRDs, Contracts, Scope documents, SOWs', color: '#06B6D4', icon_name: 'Briefcase', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 7, user_id: null, category_name: 'Bills', description: 'Invoices, Utility bills, Utility receipts, Subscriptions', color: '#EF4444', icon_name: 'Receipt', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() },
    { id: 8, user_id: null, category_name: 'Others', description: 'Miscellaneous files, temporary storage & uncategorized items', color: '#64748B', icon_name: 'Layers', created_at: new Date('2026-01-01').toISOString(), updated_at: new Date('2026-01-01').toISOString() }
];

// Fallback document counts for demo memory mode
const DEFAULT_FALLBACK_DOC_COUNTS = {
    1: 3,
    2: 4,
    3: 2,
    4: 1,
    5: 2,
    6: 1,
    7: 0,
    8: 0
};

let memoryCategories = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_CATEGORIES));
let memoryDocCounts = { ...DEFAULT_FALLBACK_DOC_COUNTS };
let nextCategoryId = 10;

class CategoryModel {
    /**
     * Get all categories for a given user along with document counts.
     * Initializes default categories if none exist.
     */
    static async getAllByUserId(userId) {
        try {
            // Check if categories table has entries for user or system defaults
            const [existing] = await pool.execute(
                'SELECT COUNT(*) as count FROM categories WHERE user_id = ? OR user_id IS NULL',
                [userId]
            );

            // If empty, auto-seed default categories for this user or database
            if (existing[0].count === 0) {
                await this.seedDefaultCategories(userId);
            }

            const query = `
                SELECT 
                    c.id,
                    c.user_id,
                    c.category_name,
                    c.description,
                    c.color,
                    c.icon_name,
                    c.created_at,
                    c.updated_at,
                    COUNT(d.id) AS document_count
                FROM categories c
                LEFT JOIN documents d ON c.id = d.category_id AND d.is_archived = 0
                WHERE c.user_id = ? OR c.user_id IS NULL
                GROUP BY c.id, c.user_id, c.category_name, c.description, c.color, c.icon_name, c.created_at, c.updated_at
                ORDER BY c.created_at ASC, c.id ASC
            `;
            const [rows] = await pool.execute(query, [userId]);
            return rows.map(r => ({
                ...r,
                document_count: Number(r.document_count || 0)
            }));
        } catch (err) {
            console.warn('[CategoryModel] MySQL query failed, using memory store fallback:', err.message);
            return memoryCategories
                .filter(c => c.user_id === null || c.user_id === Number(userId))
                .map(c => ({
                    ...c,
                    document_count: memoryDocCounts[c.id] || 0
                }));
        }
    }

    /**
     * Search categories by name.
     */
    static async searchByName(userId, searchQuery) {
        if (!searchQuery || searchQuery.trim() === '') {
            return this.getAllByUserId(userId);
        }
        const queryTerm = `%${searchQuery.trim()}%`;
        try {
            const query = `
                SELECT 
                    c.id,
                    c.user_id,
                    c.category_name,
                    c.description,
                    c.color,
                    c.icon_name,
                    c.created_at,
                    c.updated_at,
                    COUNT(d.id) AS document_count
                FROM categories c
                LEFT JOIN documents d ON c.id = d.category_id AND d.is_archived = 0
                WHERE (c.user_id = ? OR c.user_id IS NULL) AND c.category_name LIKE ?
                GROUP BY c.id, c.user_id, c.category_name, c.description, c.color, c.icon_name, c.created_at, c.updated_at
                ORDER BY c.category_name ASC
            `;
            const [rows] = await pool.execute(query, [userId, queryTerm]);
            return rows.map(r => ({
                ...r,
                document_count: Number(r.document_count || 0)
            }));
        } catch (err) {
            console.warn('[CategoryModel] MySQL search failed, using memory fallback:', err.message);
            const lowerQuery = searchQuery.trim().toLowerCase();
            return memoryCategories
                .filter(c => (c.user_id === null || c.user_id === Number(userId)) && c.category_name.toLowerCase().includes(lowerQuery))
                .map(c => ({
                    ...c,
                    document_count: memoryDocCounts[c.id] || 0
                }));
        }
    }

    /**
     * Find category by ID.
     */
    static async findById(id, userId) {
        try {
            const query = `
                SELECT 
                    c.*,
                    COUNT(d.id) AS document_count
                FROM categories c
                LEFT JOIN documents d ON c.id = d.category_id AND d.is_archived = 0
                WHERE c.id = ? AND (c.user_id = ? OR c.user_id IS NULL)
                GROUP BY c.id
            `;
            const [rows] = await pool.execute(query, [id, userId]);
            if (rows.length === 0) return null;
            return {
                ...rows[0],
                document_count: Number(rows[0].document_count || 0)
            };
        } catch (err) {
            const cat = memoryCategories.find(c => c.id === Number(id) && (c.user_id === null || c.user_id === Number(userId)));
            if (!cat) return null;
            return {
                ...cat,
                document_count: memoryDocCounts[cat.id] || 0
            };
        }
    }

    /**
     * Create a new category.
     */
    static async create({ userId, category_name, categoryName, name, description, color, icon_name, iconName, icon }) {
        const catName = (category_name || categoryName || name || 'New Category').trim();
        const catColor = color || '#3B82F6';
        const catIcon = icon_name || iconName || icon || 'Folder';
        const catDesc = description || '';

        try {
            const [result] = await pool.execute(
                `INSERT INTO categories (user_id, category_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?)`,
                [userId || null, catName, catDesc, catColor, catIcon]
            );
            const newId = result.insertId;
            return {
                id: newId,
                user_id: userId || null,
                category_name: catName,
                description: catDesc,
                color: catColor,
                icon_name: catIcon,
                document_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        } catch (err) {
            console.warn('[CategoryModel] MySQL insert failed, saving to memory fallback store:', err.message);
            const newCat = {
                id: nextCategoryId++,
                user_id: userId ? Number(userId) : null,
                category_name: catName,
                description: catDesc,
                color: catColor,
                icon_name: catIcon,
                document_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            memoryCategories.push(newCat);
            memoryDocCounts[newCat.id] = 0;
            return newCat;
        }
    }

    /**
     * Update an existing category.
     */
    static async update(id, userId, { category_name, description, color, icon_name }) {
        try {
            const updates = [];
            const values = [];

            if (category_name !== undefined) {
                updates.push('category_name = ?');
                values.push(category_name.trim());
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

            if (updates.length === 0) {
                return await this.findById(id, userId);
            }

            values.push(id, userId);
            const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND (user_id = ? OR user_id IS NULL)`;
            await pool.execute(sql, values);

            return await this.findById(id, userId);
        } catch (err) {
            console.warn('[CategoryModel] MySQL update failed, updating memory fallback store');
            const index = memoryCategories.findIndex(c => c.id === Number(id));
            if (index !== -1) {
                if (category_name !== undefined) memoryCategories[index].category_name = category_name.trim();
                if (description !== undefined) memoryCategories[index].description = description;
                if (color !== undefined) memoryCategories[index].color = color;
                if (icon_name !== undefined) memoryCategories[index].icon_name = icon_name;
                memoryCategories[index].updated_at = new Date().toISOString();
                return {
                    ...memoryCategories[index],
                    document_count: memoryDocCounts[memoryCategories[index].id] || 0
                };
            }
            return null;
        }
    }

    /**
     * Delete a category (checks if documents are assigned).
     */
    static async delete(id, userId) {
        // Step 1: Check document count
        let docCount = 0;
        try {
            const [docRows] = await pool.execute(
                'SELECT COUNT(*) as count FROM documents WHERE category_id = ? AND is_archived = 0',
                [id]
            );
            docCount = Number(docRows[0]?.count || 0);
        } catch (err) {
            docCount = memoryDocCounts[Number(id)] || 0;
        }

        if (docCount > 0) {
            return {
                success: false,
                reason: 'HAS_DOCUMENTS',
                documentCount: docCount,
                message: `Cannot delete category. There are ${docCount} document(s) assigned to this category. Please reassign or delete them first.`
            };
        }

        // Step 2: Delete category
        try {
            const [result] = await pool.execute(
                'DELETE FROM categories WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
                [id, userId]
            );
            if (result.affectedRows === 0) {
                return { success: false, reason: 'NOT_FOUND', message: 'Category not found or unauthorized.' };
            }
            return { success: true, message: 'Category deleted successfully.' };
        } catch (err) {
            console.warn('[CategoryModel] MySQL delete failed, removing from memory store');
            const index = memoryCategories.findIndex(c => c.id === Number(id));
            if (index !== -1) {
                memoryCategories.splice(index, 1);
                delete memoryDocCounts[Number(id)];
                return { success: true, message: 'Category deleted successfully.' };
            }
            return { success: false, reason: 'NOT_FOUND', message: 'Category not found.' };
        }
    }

    /**
     * Auto-seeds the 8 default categories for database.
     */
    static async seedDefaultCategories(userId) {
        try {
            for (const cat of DEFAULT_SYSTEM_CATEGORIES) {
                await pool.execute(
                    `INSERT IGNORE INTO categories (id, user_id, category_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?, ?)`,
                    [cat.id, userId, cat.category_name, cat.description, cat.color, cat.icon_name]
                );
            }
        } catch (err) {
            console.warn('[CategoryModel] Seeding defaults failed:', err.message);
        }
    }
}

module.exports = CategoryModel;
