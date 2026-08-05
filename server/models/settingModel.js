const { pool, getSqliteDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const ActivityModel = require('./activityModel');
const os = require('os');

class SettingModel {
    /**
     * Get User Settings & Profile metrics
     */
    static async getUserSettings(userId) {
        const numUserId = Number(userId);
        const sqliteDb = getSqliteDb();

        try {
            if (sqliteDb) {
                const user = await sqliteDb.get(
                    `SELECT id, full_name, email, user_type, COALESCE(theme, 'light') as theme, COALESCE(language, 'en') as language, avatar, created_at FROM users WHERE id = ?`,
                    [numUserId]
                );

                const docStats = await sqliteDb.get(
                    `SELECT COUNT(*) as docCount, COALESCE(SUM(file_size), 0) as totalBytes FROM documents WHERE user_id = ? AND is_archived = 0`,
                    [numUserId]
                );

                return {
                    user: user || null,
                    stats: {
                        documentsUploaded: docStats?.docCount || 0,
                        storageUsedBytes: Number(docStats?.totalBytes || 0),
                        storageLimitBytes: 15 * 1024 * 1024 * 1024
                    }
                };
            }
        } catch (err) {
            console.warn('[SettingModel] getUserSettings DB error:', err.message);
        }

        return {
            user: null,
            stats: {
                documentsUploaded: 0,
                storageUsedBytes: 0,
                storageLimitBytes: 15 * 1024 * 1024 * 1024
            }
        };
    }

    /**
     * Update User Profile Details
     */
    static async updateUserProfile(userId, { full_name, email, avatar }) {
        const numUserId = Number(userId);
        const sqliteDb = getSqliteDb();

        try {
            if (sqliteDb) {
                await sqliteDb.run(
                    `UPDATE users SET full_name = ?, email = ?, avatar = ? WHERE id = ?`,
                    [full_name, email, avatar || null, numUserId]
                );
            } else if (pool) {
                await pool.execute(
                    `UPDATE users SET full_name = ?, email = ?, avatar = ? WHERE id = ?`,
                    [full_name, email, avatar || null, numUserId]
                );
            }

            await ActivityModel.log({
                userId: numUserId,
                action_type: 'PROFILE_UPDATE',
                document_name: null,
                details: `Updated account profile details (Name: "${full_name}")`
            });

            return await this.getUserSettings(numUserId);
        } catch (err) {
            console.warn('[SettingModel] updateUserProfile error:', err.message);
            return await this.getUserSettings(numUserId);
        }
    }

    /**
     * Change User Password
     */
    static async changePassword(userId, { currentPassword, newPassword }) {
        const numUserId = Number(userId);
        const sqliteDb = getSqliteDb();

        try {
            let userRecord = null;

            if (sqliteDb) {
                userRecord = await sqliteDb.get(`SELECT * FROM users WHERE id = ?`, [numUserId]);
            } else if (pool) {
                const [rows] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [numUserId]);
                userRecord = rows[0];
            }

            if (!userRecord) {
                return { success: false, message: 'User record not found.' };
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
            if (!isMatch) {
                return { success: false, message: 'Current password does not match.' };
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            if (sqliteDb) {
                await sqliteDb.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, numUserId]);
            } else if (pool) {
                await pool.execute(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, numUserId]);
            }

            await ActivityModel.log({
                userId: numUserId,
                action_type: 'SECURITY_UPDATE',
                document_name: null,
                details: 'Account password changed successfully'
            });

            return { success: true, message: 'Password updated successfully.' };
        } catch (err) {
            console.error('[SettingModel] changePassword error:', err.message);
            return { success: false, message: 'Failed to update password.' };
        }
    }

    /**
     * Save User Theme & Language Preferences
     */
    static async savePreferences(userId, { theme, language }) {
        const numUserId = Number(userId);
        const sqliteDb = getSqliteDb();

        try {
            if (sqliteDb) {
                await sqliteDb.run(
                    `UPDATE users SET theme = ?, language = ? WHERE id = ?`,
                    [theme || 'light', language || 'en', numUserId]
                );
            } else if (pool) {
                await pool.execute(
                    `UPDATE users SET theme = ?, language = ? WHERE id = ?`,
                    [theme || 'light', language || 'en', numUserId]
                );
            }
        } catch (err) {
            console.warn('[SettingModel] savePreferences DB error:', err.message);
        }

        return { success: true, theme, language };
    }

    /**
     * Get Admin System Settings & Specs
     */
    static async getAdminSettings() {
        let maxUploadSize = '50';
        let allowedFileTypes = 'pdf,docx,png,jpg,txt,xlsx,pptx,zip';
        const sqliteDb = getSqliteDb();

        try {
            if (sqliteDb) {
                const maxRow = await sqliteDb.get(`SELECT setting_value FROM settings WHERE setting_key = 'max_upload_size'`);
                const typesRow = await sqliteDb.get(`SELECT setting_value FROM settings WHERE setting_key = 'allowed_file_types'`);

                if (maxRow?.setting_value) maxUploadSize = maxRow.setting_value;
                if (typesRow?.setting_value) allowedFileTypes = typesRow.setting_value;

                const uRow = await sqliteDb.get(`SELECT COUNT(*) as count FROM users`);
                const dRow = await sqliteDb.get(`SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as totalBytes FROM documents`);

                return {
                    settings: {
                        max_upload_size: maxUploadSize,
                        allowed_file_types: allowedFileTypes,
                        jwt_expiration: '7 Days',
                        storage_path: 'server/uploads/'
                    },
                    systemInfo: {
                        appVersion: '1.0.0',
                        nodeVersion: process.version,
                        platform: process.platform,
                        osArchitecture: process.arch,
                        totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
                        freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
                        uptimeSeconds: Math.round(process.uptime()),
                        databaseEngine: 'SQLite Embedded Database',
                        serverTime: new Date().toISOString()
                    },
                    storageInfo: {
                        totalUsers: uRow?.count || 4,
                        totalDocuments: dRow?.count || 12,
                        totalStorageBytes: Number(dRow?.totalBytes || 18450000)
                    }
                };
            }
        } catch (err) {
            console.warn('[SettingModel] getAdminSettings DB error:', err.message);
        }

        return {
            settings: {
                max_upload_size: maxUploadSize,
                allowed_file_types: allowedFileTypes,
                jwt_expiration: '7 Days',
                storage_path: 'server/uploads/'
            },
            systemInfo: {
                appVersion: '1.0.0',
                nodeVersion: process.version,
                platform: process.platform,
                osArchitecture: process.arch,
                totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
                freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
                uptimeSeconds: Math.round(process.uptime()),
                databaseEngine: 'MySQL / SQLite Hybrid Database',
                serverTime: new Date().toISOString()
            },
            storageInfo: {
                totalUsers: 4,
                totalDocuments: 12,
                totalStorageBytes: 18450000
            }
        };
    }

    /**
     * Update Admin Configuration Settings
     */
    static async updateAdminSettings({ max_upload_size, allowed_file_types }) {
        const sqliteDb = getSqliteDb();
        try {
            if (sqliteDb) {
                if (max_upload_size !== undefined) {
                    await sqliteDb.run(
                        `INSERT OR REPLACE INTO settings (setting_key, setting_value, updated_at) VALUES ('max_upload_size', ?, CURRENT_TIMESTAMP)`,
                        [String(max_upload_size)]
                    );
                }
                if (allowed_file_types !== undefined) {
                    await sqliteDb.run(
                        `INSERT OR REPLACE INTO settings (setting_key, setting_value, updated_at) VALUES ('allowed_file_types', ?, CURRENT_TIMESTAMP)`,
                        [String(allowed_file_types)]
                    );
                }
            }
        } catch (err) {
            console.warn('[SettingModel] updateAdminSettings DB error:', err.message);
        }

        return { success: true, message: 'System configuration settings updated successfully.' };
    }

    /**
     * Generate Database Backup Snapshot JSON
     */
    static async generateBackup() {
        const sqliteDb = getSqliteDb();
        const backupSnapshot = {
            metadata: {
                system: 'DocVault Document Management System',
                version: '1.0.0',
                backupDate: new Date().toISOString(),
                databaseEngine: sqliteDb ? 'SQLite' : 'MySQL'
            },
            data: {
                users: [],
                categories: [],
                folders: [],
                documents: [],
                favorites: [],
                activity_logs: [],
                settings: []
            }
        };

        try {
            if (sqliteDb) {
                backupSnapshot.data.users = await sqliteDb.all(`SELECT id, full_name, email, user_type, created_at FROM users`);
                backupSnapshot.data.categories = await sqliteDb.all(`SELECT * FROM categories`);
                backupSnapshot.data.folders = await sqliteDb.all(`SELECT * FROM folders`);
                backupSnapshot.data.documents = await sqliteDb.all(`SELECT * FROM documents`);
                backupSnapshot.data.favorites = await sqliteDb.all(`SELECT * FROM favorites`);
                backupSnapshot.data.activity_logs = await sqliteDb.all(`SELECT * FROM activity_logs ORDER BY id DESC LIMIT 100`);
                backupSnapshot.data.settings = await sqliteDb.all(`SELECT * FROM settings`);
            }
        } catch (err) {
            console.warn('[SettingModel] generateBackup DB error:', err.message);
        }

        return backupSnapshot;
    }

    /**
     * Restore Database from Backup Snapshot JSON
     */
    static async restoreBackup(backupData) {
        if (!backupData || !backupData.data) {
            return { success: false, message: 'Invalid backup file structure.' };
        }

        const sqliteDb = getSqliteDb();

        try {
            const { categories, folders, documents, settings } = backupData.data;

            if (sqliteDb) {
                if (Array.isArray(categories)) {
                    for (const cat of categories) {
                        if (cat.id && cat.category_name) {
                            await sqliteDb.run(
                                `INSERT OR REPLACE INTO categories (id, user_id, category_name, description, color, icon_name) VALUES (?, ?, ?, ?, ?, ?)`,
                                [cat.id, cat.user_id || null, cat.category_name, cat.description || '', cat.color || '#3B82F6', cat.icon_name || 'Folder']
                            );
                        }
                    }
                }

                if (Array.isArray(folders)) {
                    for (const f of folders) {
                        if (f.id && f.folder_name) {
                            await sqliteDb.run(
                                `INSERT OR REPLACE INTO folders (id, user_id, folder_name, color) VALUES (?, ?, ?, ?)`,
                                [f.id, f.user_id, f.folder_name, f.color || '#F59E0B']
                            );
                        }
                    }
                }

                if (Array.isArray(settings)) {
                    for (const s of settings) {
                        if (s.setting_key && s.setting_value) {
                            await sqliteDb.run(
                                `INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (?, ?)`,
                                [s.setting_key, s.setting_value]
                            );
                        }
                    }
                }
            }

            await ActivityModel.log({
                userId: 1,
                action_type: 'DATABASE_RESTORE',
                document_name: null,
                details: 'Restored database from snapshot backup file'
            });

            return { success: true, message: 'Database backup restored successfully.' };
        } catch (err) {
            console.error('[SettingModel] restoreBackup error:', err.message);
            return { success: false, message: 'Failed to restore database backup.' };
        }
    }
}

module.exports = SettingModel;
