const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let dbInstance = null;

async function initSqlite() {
    if (dbInstance) return dbInstance;

    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'document_management.sqlite');

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Enable PRAGMA foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON;');

    // Create Tables if not exists
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            user_type TEXT DEFAULT 'individual',
            mobile_number TEXT NULL,
            phone_verified INTEGER DEFAULT 0,
            college_name TEXT NULL,
            department TEXT NULL,
            year_of_study TEXT NULL,
            student_id TEXT NULL,
            company_name TEXT NULL,
            designation TEXT NULL,
            industry TEXT NULL,
            years_of_experience TEXT NULL,
            employee_id TEXT NULL,
            occupation TEXT NULL,
            country TEXT NULL,
            state TEXT NULL,
            city TEXT NULL,
            theme TEXT DEFAULT 'light',
            language TEXT DEFAULT 'en',
            avatar TEXT NULL,
            is_active INTEGER DEFAULT 1,
            is_blocked INTEGER DEFAULT 0,
            last_login_at TEXT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            category_name TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#3B82F6',
            icon_name TEXT DEFAULT 'Folder',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            folder_name TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#3B82F6',
            icon_name TEXT DEFAULT 'Folder',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            folder_id INTEGER NULL,
            title TEXT NOT NULL,
            description TEXT,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            is_favorite INTEGER DEFAULT 0,
            is_archived INTEGER DEFAULT 0,
            expiry_date TEXT NULL,
            deleted_at TEXT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            document_name TEXT NULL,
            details TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS download_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            document_id INTEGER NOT NULL,
            downloaded_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            document_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT NOT NULL UNIQUE,
            setting_value TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS landing_cms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            website_title TEXT,
            hero_title TEXT,
            hero_subtitle TEXT,
            hero_banner_image TEXT,
            about_title TEXT,
            about_content TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            footer_text TEXT,
            section_hero_enabled INTEGER DEFAULT 1,
            section_features_enabled INTEGER DEFAULT 1,
            section_categories_enabled INTEGER DEFAULT 1,
            section_audience_enabled INTEGER DEFAULT 1,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            theme_name TEXT NOT NULL UNIQUE,
            primary_color TEXT DEFAULT '#FF6B00',
            secondary_color TEXT DEFAULT '#1e293b',
            background_color TEXT DEFAULT '#ffffff',
            sidebar_color TEXT DEFAULT '#ffffff',
            header_color TEXT DEFAULT '#ffffff',
            card_color TEXT DEFAULT '#ffffff',
            button_color TEXT DEFAULT '#FF6B00',
            button_text_color TEXT DEFAULT '#ffffff',
            text_color TEXT DEFAULT '#0f172a',
            border_color TEXT DEFAULT '#e2e8f0',
            hover_color TEXT DEFAULT '#f1f5f9',
            success_color TEXT DEFAULT '#10b981',
            warning_color TEXT DEFAULT '#f59e0b',
            error_color TEXT DEFAULT '#ef4444',
            is_active INTEGER DEFAULT 1,
            is_default INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_theme_preferences (
            user_id INTEGER PRIMARY KEY,
            theme_id INTEGER NULL,
            is_custom INTEGER DEFAULT 0,
            primary_color TEXT NULL,
            sidebar_color TEXT NULL,
            header_color TEXT NULL,
            background_color TEXT NULL,
            card_color TEXT NULL,
            text_color TEXT NULL,
            button_color TEXT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Safely add missing columns to existing databases
    const migrations = [
        "ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1",
        "ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN last_login_at TEXT NULL",
        "ALTER TABLE users ADD COLUMN avatar TEXT NULL",
        "ALTER TABLE users ADD COLUMN mobile_number TEXT NULL",
        "ALTER TABLE users ADD COLUMN phone_verified INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN college_name TEXT NULL",
        "ALTER TABLE users ADD COLUMN department TEXT NULL",
        "ALTER TABLE users ADD COLUMN year_of_study TEXT NULL",
        "ALTER TABLE users ADD COLUMN student_id TEXT NULL",
        "ALTER TABLE users ADD COLUMN company_name TEXT NULL",
        "ALTER TABLE users ADD COLUMN designation TEXT NULL",
        "ALTER TABLE users ADD COLUMN industry TEXT NULL",
        "ALTER TABLE users ADD COLUMN years_of_experience TEXT NULL",
        "ALTER TABLE users ADD COLUMN employee_id TEXT NULL",
        "ALTER TABLE users ADD COLUMN occupation TEXT NULL",
        "ALTER TABLE users ADD COLUMN country TEXT NULL",
        "ALTER TABLE users ADD COLUMN state TEXT NULL",
        "ALTER TABLE users ADD COLUMN city TEXT NULL",
        "ALTER TABLE documents ADD COLUMN deleted_at TEXT NULL",
        "ALTER TABLE documents ADD COLUMN expiry_date TEXT NULL",
        "ALTER TABLE categories ADD COLUMN is_active INTEGER DEFAULT 1"
    ];

    for (const sql of migrations) {
        try { await dbInstance.exec(sql); } catch (e) { /* Column likely exists */ }
    }

    // Seed default categories if empty
    const catCount = await dbInstance.get('SELECT COUNT(*) as count FROM categories');
    if (!catCount || catCount.count === 0) {
        await dbInstance.exec(`
            INSERT INTO categories (id, user_id, category_name, description, color, icon_name) VALUES
            (1, NULL, 'Personal Documents', 'IDs, Passports, Birth Certificates, Taxes', '#3B82F6', 'UserCheck'),
            (2, NULL, 'Academic Documents', 'Degrees, Transcripts, Marksheets, Diplomas', '#10B981', 'GraduationCap'),
            (3, NULL, 'Project Documents', 'Specifications, Code Docs, Reports, Diagrams', '#8B5CF6', 'FolderGit2'),
            (4, NULL, 'Certificates', 'Professional certifications, Course completion proofs', '#EC4899', 'Award'),
            (5, NULL, 'Resume', 'Resume drafts, CV versions, Cover letters, Portfolios', '#F59E0B', 'FileText'),
            (6, NULL, 'Client Requirement Documents', 'BRDs, Contracts, Scope documents, SOWs', '#06B6D4', 'Briefcase'),
            (7, NULL, 'Bills', 'Invoices, Utility bills, Utility receipts, Subscriptions', '#EF4444', 'Receipt'),
            (8, NULL, 'Others', 'Miscellaneous files, temporary storage & uncategorized items', '#64748B', 'Layers');
        `);
    }

    // Seed default themes if empty
    const themeCount = await dbInstance.get('SELECT COUNT(*) as count FROM themes');
    if (!themeCount || themeCount.count === 0) {
        await dbInstance.exec(`
            INSERT INTO themes (id, theme_name, primary_color, secondary_color, background_color, sidebar_color, header_color, card_color, button_color, button_text_color, text_color, border_color, hover_color, success_color, warning_color, error_color, is_active, is_default) VALUES
            (1, 'DocVault Original', '#FF6B00', '#FF8A00', '#f8fafc', '#ffffff', '#ffffff', '#ffffff', '#FF6B00', '#ffffff', '#0f172a', '#e2e8f0', '#fff7ed', '#10b981', '#f59e0b', '#ef4444', 1, 1),
            (2, 'Midnight Dark', '#3b82f6', '#60a5fa', '#0f172a', '#1e293b', '#1e293b', '#1e293b', '#3b82f6', '#ffffff', '#f8fafc', '#334155', '#334155', '#10b981', '#f59e0b', '#ef4444', 1, 0),
            (3, 'Ocean Blue', '#0ea5e9', '#38bdf8', '#f0f9ff', '#ffffff', '#e0f2fe', '#ffffff', '#0ea5e9', '#ffffff', '#0c4a6e', '#bae6fd', '#e0f2fe', '#10b981', '#f59e0b', '#ef4444', 1, 0);
        `);
    }

    return dbInstance;
}

module.exports = { initSqlite };
