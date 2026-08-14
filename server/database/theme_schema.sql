-- Theme Management Tables

CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    theme_name VARCHAR(100) NOT NULL UNIQUE,
    primary_color VARCHAR(30) DEFAULT '#1B664B',
    secondary_color VARCHAR(30) DEFAULT '#14523C',
    background_color VARCHAR(30) DEFAULT '#E8F5F0',
    sidebar_color VARCHAR(30) DEFAULT '#ffffff',
    header_color VARCHAR(30) DEFAULT '#ffffff',
    card_color VARCHAR(30) DEFAULT '#ffffff',
    button_color VARCHAR(30) DEFAULT '#1B664B',
    button_text_color VARCHAR(30) DEFAULT '#ffffff',
    text_color VARCHAR(30) DEFAULT '#17211B',
    border_color VARCHAR(30) DEFAULT '#D1EBE1',
    hover_color VARCHAR(30) DEFAULT '#D1EBE1',
    success_color VARCHAR(30) DEFAULT '#1B664B',
    warning_color VARCHAR(30) DEFAULT '#f59e0b',
    error_color VARCHAR(30) DEFAULT '#ef4444',
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a default theme if table is empty
INSERT IGNORE INTO themes (id, theme_name, primary_color, secondary_color, background_color, sidebar_color, header_color, card_color, button_color, button_text_color, text_color, border_color, hover_color, success_color, warning_color, error_color, is_active, is_default) VALUES
(1, 'DocVault Premium Green', '#1B664B', '#14523C', '#E8F5F0', '#ffffff', '#ffffff', '#ffffff', '#1B664B', '#ffffff', '#17211B', '#D1EBE1', '#D1EBE1', '#1B664B', '#f59e0b', '#ef4444', 1, 1),
(2, 'Midnight Green Dark', '#1B664B', '#14523C', '#051A12', '#0A2D20', '#0A2D20', '#0A2D20', '#1B664B', '#ffffff', '#E8F5F0', '#0F402E', '#0A2D20', '#1B664B', '#f59e0b', '#ef4444', 1, 0),
(3, 'Ocean Green', '#1B664B', '#14523C', '#f0f9ff', '#ffffff', '#e0f2fe', '#ffffff', '#1B664B', '#ffffff', '#0c4a6e', '#bae6fd', '#e0f2fe', '#1B664B', '#f59e0b', '#ef4444', 1, 0);

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
