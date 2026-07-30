const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { initSqlite } = require('./sqlite');

dotenv.config();

let useSQLite = false;
let sqliteDb = null;

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
 * Test Database connection (MySQL first, automatic Embedded SQLite fallback if MySQL is offline)
 */
async function testConnection() {
    try {
        const connection = await mysqlPool.getConnection();
        console.log('✅ MySQL Database connected successfully.');
        connection.release();
        useSQLite = false;
        return true;
    } catch (err) {
        useSQLite = true;
        try {
            sqliteDb = await initSqlite();
            console.log('=================================================');
            console.log('💾 Database Mode: Embedded SQLite Database Active 🚀');
            console.log('✨ Embedded database stored at: server/database/document_management.sqlite');
            console.log('💡 Note: Zero-config! No XAMPP or external MySQL required.');
            console.log('=================================================');
            return true;
        } catch (sqliteErr) {
            console.error('❌ Failed to initialize SQLite database fallback:', sqliteErr.message);
            return false;
        }
    }
}

/**
 * Execute wrapper supporting both MySQL and SQLite
 */
const pool = {
    async execute(sql, params = []) {
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
    getSqliteDb: () => sqliteDb
};
