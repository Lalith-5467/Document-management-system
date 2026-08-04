const ThemeModel = require('../models/themeModel');

exports.getThemes = async (req, res) => {
    try {
        const isAdmin = req.user.userType === 'admin';
        const themes = isAdmin ? await ThemeModel.getAllThemes() : await ThemeModel.getActiveThemes();
        res.json({ success: true, themes });
    } catch (error) {
        console.error('Error fetching themes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createTheme = async (req, res) => {
    try {
        if (req.body.is_default) {
            await ThemeModel.clearDefaultTheme();
        }
        const insertId = await ThemeModel.createTheme(req.body);
        res.status(201).json({ success: true, message: 'Theme created successfully', id: insertId });
    } catch (error) {
        console.error('Error creating theme:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateTheme = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.is_default) {
            await ThemeModel.clearDefaultTheme();
        }
        await ThemeModel.updateTheme(id, req.body);
        res.json({ success: true, message: 'Theme updated successfully' });
    } catch (error) {
        console.error('Error updating theme:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteTheme = async (req, res) => {
    try {
        const { id } = req.params;
        await ThemeModel.deleteTheme(id);
        res.json({ success: true, message: 'Theme deleted successfully' });
    } catch (error) {
        console.error('Error deleting theme:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getUserPreference = async (req, res) => {
    try {
        const userId = req.user.id;
        const preference = await ThemeModel.getUserPreference(userId);
        
        // If preference exists and points to a theme_id, we might want to fetch that theme
        // But for simplicity, the frontend can cross-reference with the active themes list,
        // or we return the full theme if needed. 
        if (preference && preference.theme_id && !preference.is_custom) {
            const theme = await ThemeModel.getThemeById(preference.theme_id);
            res.json({ success: true, preference, theme });
        } else {
            res.json({ success: true, preference });
        }
    } catch (error) {
        console.error('Error fetching user theme preference:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.saveUserPreference = async (req, res) => {
    try {
        const userId = req.user.id;
        await ThemeModel.saveUserPreference(userId, req.body);
        res.json({ success: true, message: 'Theme preference saved successfully' });
    } catch (error) {
        console.error('Error saving user theme preference:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
