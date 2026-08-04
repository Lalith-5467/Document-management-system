const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/db');

async function runSQL() {
    try {
        await testConnection();
        const sqlFilePath = path.join(__dirname, '../database/theme_schema.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Split by semicolon and filter empty statements
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (let statement of statements) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            await pool.execute(statement);
        }
        
        console.log('✅ Theme schema applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error executing SQL:', err);
        process.exit(1);
    }
}

runSQL();
