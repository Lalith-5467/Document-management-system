const { pool } = require('../config/db');

class ThemeModel {
    static async getAllThemes() {
        const [rows] = await pool.execute('SELECT * FROM themes ORDER BY is_default DESC, created_at DESC');
        return rows;
    }

    static async getActiveThemes() {
        const [rows] = await pool.execute('SELECT * FROM themes WHERE is_active = 1 ORDER BY is_default DESC, created_at DESC');
        return rows;
    }

    static async getThemeById(id) {
        const [rows] = await pool.execute('SELECT * FROM themes WHERE id = ?', [id]);
        return rows.length ? rows[0] : null;
    }

    static async createTheme(data) {
        const sql = `
            INSERT INTO themes (
                theme_name, primary_color, secondary_color, background_color, 
                sidebar_color, header_color, card_color, button_color, 
                button_text_color, text_color, border_color, hover_color, 
                success_color, warning_color, error_color, is_active, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.theme_name, data.primary_color || '#1B664B', data.secondary_color || '#14523C',
            data.background_color || '#E8F5F0', data.sidebar_color || '#ffffff',
            data.header_color || '#ffffff', data.card_color || '#ffffff',
            data.button_color || '#1B664B', data.button_text_color || '#ffffff',
            data.text_color || '#17211B', data.border_color || '#D1EBE1',
            data.hover_color || '#14523C', data.success_color || '#1B664B',
            data.warning_color || '#f59e0b', data.error_color || '#ef4444',
            data.is_active !== undefined ? data.is_active : 1,
            data.is_default !== undefined ? data.is_default : 0
        ];
        const [result] = await pool.execute(sql, params);
        return result.insertId;
    }

    static async updateTheme(id, data) {
        const sql = `
            UPDATE themes SET
                theme_name = ?, primary_color = ?, secondary_color = ?, background_color = ?,
                sidebar_color = ?, header_color = ?, card_color = ?, button_color = ?,
                button_text_color = ?, text_color = ?, border_color = ?, hover_color = ?,
                success_color = ?, warning_color = ?, error_color = ?, is_active = ?, is_default = ?
            WHERE id = ?
        `;
        const params = [
            data.theme_name, data.primary_color, data.secondary_color, data.background_color,
            data.sidebar_color, data.header_color, data.card_color, data.button_color,
            data.button_text_color, data.text_color, data.border_color, data.hover_color,
            data.success_color, data.warning_color, data.error_color, data.is_active, data.is_default,
            id
        ];
        await pool.execute(sql, params);
    }

    static async deleteTheme(id) {
        await pool.execute('DELETE FROM themes WHERE id = ?', [id]);
    }

    static async clearDefaultTheme() {
        await pool.execute('UPDATE themes SET is_default = 0 WHERE is_default = 1');
    }

    static async getUserPreference(userId) {
        const [rows] = await pool.execute('SELECT * FROM user_theme_preferences WHERE user_id = ?', [userId]);
        return rows.length ? rows[0] : null;
    }

    static async saveUserPreference(userId, data) {
        // Upsert logic based on MySQL (or SQLite compliant if not using duplicate key update)
        // Since we use the SQLite wrapper, we'll DELETE and INSERT or check existence
        const [rows] = await pool.execute('SELECT * FROM user_theme_preferences WHERE user_id = ?', [userId]);
        if (rows.length > 0) {
            await pool.execute(`
                UPDATE user_theme_preferences SET 
                    theme_id = ?, is_custom = ?, primary_color = ?, sidebar_color = ?, 
                    header_color = ?, background_color = ?, card_color = ?, text_color = ?, button_color = ?
                WHERE user_id = ?
            `, [
                data.theme_id || null, data.is_custom ? 1 : 0, data.primary_color || null,
                data.sidebar_color || null, data.header_color || null, data.background_color || null,
                data.card_color || null, data.text_color || null, data.button_color || null,
                userId
            ]);
        } else {
            await pool.execute(`
                INSERT INTO user_theme_preferences (
                    user_id, theme_id, is_custom, primary_color, sidebar_color, 
                    header_color, background_color, card_color, text_color, button_color
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId, data.theme_id || null, data.is_custom ? 1 : 0, data.primary_color || null,
                data.sidebar_color || null, data.header_color || null, data.background_color || null,
                data.card_color || null, data.text_color || null, data.button_color || null
            ]);
        }
    }
}

module.exports = ThemeModel;
