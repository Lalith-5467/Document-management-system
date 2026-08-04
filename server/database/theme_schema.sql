-- Theme Management Tables

CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    theme_name VARCHAR(100) NOT NULL UNIQUE,
    primary_color VARCHAR(30) DEFAULT '#FF6B00',
    secondary_color VARCHAR(30) DEFAULT '#1e293b',
    background_color VARCHAR(30) DEFAULT '#ffffff',
    sidebar_color VARCHAR(30) DEFAULT '#ffffff',
    header_color VARCHAR(30) DEFAULT '#ffffff',
    card_color VARCHAR(30) DEFAULT '#ffffff',
    button_color VARCHAR(30) DEFAULT '#FF6B00',
    button_text_color VARCHAR(30) DEFAULT '#ffffff',
    text_color VARCHAR(30) DEFAULT '#0f172a',
    border_color VARCHAR(30) DEFAULT '#e2e8f0',
    hover_color VARCHAR(30) DEFAULT '#f1f5f9',
    success_color VARCHAR(30) DEFAULT '#10b981',
    warning_color VARCHAR(30) DEFAULT '#f59e0b',
    error_color VARCHAR(30) DEFAULT '#ef4444',
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a default theme if table is empty
INSERT IGNORE INTO themes (id, theme_name, primary_color, secondary_color, background_color, sidebar_color, header_color, card_color, button_color, button_text_color, text_color, border_color, hover_color, success_color, warning_color, error_color, is_active, is_default) VALUES
(1, 'DocVault Original', '#FF6B00', '#FF8A00', '#f8fafc', '#ffffff', '#ffffff', '#ffffff', '#FF6B00', '#ffffff', '#0f172a', '#e2e8f0', '#fff7ed', '#10b981', '#f59e0b', '#ef4444', 1, 1),
(2, 'Midnight Dark', '#3b82f6', '#60a5fa', '#0f172a', '#1e293b', '#1e293b', '#1e293b', '#3b82f6', '#ffffff', '#f8fafc', '#334155', '#334155', '#10b981', '#f59e0b', '#ef4444', 1, 0),
(3, 'Ocean Blue', '#0ea5e9', '#38bdf8', '#f0f9ff', '#ffffff', '#e0f2fe', '#ffffff', '#0ea5e9', '#ffffff', '#0c4a6e', '#bae6fd', '#e0f2fe', '#10b981', '#f59e0b', '#ef4444', 1, 0);

CREATE TABLE IF NOT EXISTS user_theme_preferences (
    user_id INT PRIMARY KEY,
    theme_id INT NULL,
    is_custom TINYINT(1) DEFAULT 0,
    primary_color VARCHAR(30) NULL,
    sidebar_color VARCHAR(30) NULL,
    header_color VARCHAR(30) NULL,
    background_color VARCHAR(30) NULL,
    card_color VARCHAR(30) NULL,
    text_color VARCHAR(30) NULL,
    button_color VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);
