const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { initSqlite } = require('./sqlite');

dotenv.config();

let useSQLite = false;
let sqliteDb = null;
let lastMySQLRetry = 0;

// Initialize MySQL pool
const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'document_management_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Sync all MySQL data into SQLite so offline mode works with real data
 */
async function syncMySQLToSQLite() {
    if (!sqliteDb) return;
    try {
        const conn = await mysqlPool.getConnection();

        // Sync users
        const [users] = await conn.execute('SELECT * FROM users');
        for (const u of users) {
            try {
                await sqliteDb.run(
                    `INSERT OR REPLACE INTO users (id, full_name, email, password, user_type, mobile_number, company_name, designation, industry, years_of_experience, is_active, is_blocked, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [u.id, u.full_name, u.email, u.password, u.user_type, u.mobile_number, u.company_name, u.designation, u.industry, u.years_of_experience, u.is_active || 1, u.is_blocked || 0, u.created_at, u.updated_at]
                );
            } catch (e) { /* skip */ }
        }

        // Sync categories
        const [cats] = await conn.execute('SELECT * FROM categories');
        for (const c of cats) {
            try {
                await sqliteDb.run(
                    `INSERT OR REPLACE INTO categories (id, user_id, category_name, description, color, icon_name, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [c.id, c.user_id, c.category_name, c.description, c.color, c.icon_name, c.is_active || 1, c.created_at]
                );
            } catch (e) { /* skip */ }
        }

        // Sync folders
        const [folders] = await conn.execute('SELECT * FROM folders');
        for (const f of folders) {
            try {
                await sqliteDb.run(
                    `INSERT OR REPLACE INTO folders (id, user_id, folder_name, description, color, icon_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [f.id, f.user_id, f.folder_name, f.description, f.color, f.icon_name, f.created_at]
                );
            } catch (e) { /* skip */ }
        }

        // Sync documents
        const [docs] = await conn.execute('SELECT * FROM documents');
        for (const d of docs) {
            try {
                await sqliteDb.run(
                    `INSERT OR REPLACE INTO documents (id, user_id, category_id, folder_id, title, description, file_name, file_path, file_size, mime_type, is_favorite, is_archived, expiry_date, deleted_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [d.id, d.user_id, d.category_id, d.folder_id, d.title, d.description, d.file_name, d.file_path, d.file_size, d.mime_type, d.is_favorite || 0, d.is_archived || 0, d.expiry_date, d.deleted_at, d.created_at, d.updated_at]
                );
            } catch (e) { /* skip */ }
        }

        conn.release();
        console.log(`✅ Synced ${users.length} users, ${cats.length} categories, ${folders.length} folders, ${docs.length} documents from MySQL → SQLite`);
    } catch (e) {
        // MySQL not available, skip sync silently
    }
}

/**
 * Test Database connection (MySQL first, automatic Embedded SQLite fallback if MySQL is offline)
 */
async function testConnection() {
    // Always init SQLite as backup
    if (!sqliteDb) {
        try { sqliteDb = await initSqlite(); } catch (e) { /* ignore */ }
    }

    try {
        const connection = await mysqlPool.getConnection();
        console.log('✅ MySQL Database connected successfully.');
        connection.release();
        useSQLite = false;

        // Sync MySQL data to SQLite for offline resilience
        await syncMySQLToSQLite();

        return true;
    } catch (err) {
        useSQLite = true;
        if (!sqliteDb) {
            try { sqliteDb = await initSqlite(); } catch (sqliteErr) {
                console.error('❌ Failed to initialize SQLite database fallback:', sqliteErr.message);
                return false;
            }
        }
        console.log('=================================================');
        console.log('💾 Database Mode: Embedded SQLite Database Active 🚀');
        console.log('✨ Embedded database stored at: server/database/document_management.sqlite');
        console.log('💡 Note: Zero-config! No XAMPP or external MySQL required.');
        console.log('=================================================');
        return true;
    }
}

/**
 * Execute wrapper supporting both MySQL and SQLite
 */
const pool = {
    async execute(sql, params = []) {
        // Periodically retry MySQL in background if it was previously down (every 60 seconds)
        if (useSQLite) {
            const now = Date.now();
            if (now - lastMySQLRetry > 60000) {
                lastMySQLRetry = now;
                // Run connection test in background without blocking query execution
                Promise.race([
                    mysqlPool.getConnection(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('MySQL Connect Timeout')), 500))
                ]).then(conn => {
                    conn.release();
                    useSQLite = false;
                    console.log('✅ MySQL reconnected!');
                    syncMySQLToSQLite().catch(() => {});
                }).catch(() => {
                    // Still offline, retain SQLite
                });
            }
        }

        if (!useSQLite) {
            try {
                return await mysqlPool.execute(sql, params);
            } catch (err) {
                if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
                    useSQLite = true;
                    if (!sqliteDb) sqliteDb = await initSqlite();
                } else {
                    throw err;
                }
            }
        }

        if (!sqliteDb) sqliteDb = await initSqlite();

        // Convert MySQL SQL syntax to SQLite compatible
        let formattedSql = sql
            .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
            .replace(/TINYINT\(1\)/gi, 'INTEGER')
            .replace(/BIGINT/gi, 'INTEGER')
            .replace(/INSERT IGNORE INTO/gi, 'INSERT OR IGNORE INTO')
            .replace(/CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, 'CURRENT_TIMESTAMP');

        const trimmed = formattedSql.trim().toUpperCase();

        if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('EXPLAIN')) {
            const rows = await sqliteDb.all(formattedSql, params);
            return [rows, []];
        } else {
            const result = await sqliteDb.run(formattedSql, params);
            return [{
                insertId: result.lastID,
                affectedRows: result.changes,
                changes: result.changes
            }, []];
        }
    },

    async getConnection() {
        if (!useSQLite) {
            try {
                return await mysqlPool.getConnection();
            } catch (err) {
                useSQLite = true;
            }
        }
        return {
            release: () => {},
            execute: (sql, params) => pool.execute(sql, params)
        };
    }
};

module.exports = {
    pool,
    testConnection,
    isSQLite: () => useSQLite,
    getIsSQLite: () => useSQLite,
    get sqliteDb() { return sqliteDb; },
    getSqliteDb: () => sqliteDb
};
