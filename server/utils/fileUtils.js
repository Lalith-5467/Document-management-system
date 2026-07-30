const fs = require('fs');
const path = require('path');

const UPLOADS_BASE_DIR = path.join(__dirname, '..', 'uploads');

const CATEGORY_SUBDIR_MAP = {
    'personal documents': 'personal',
    'academic documents': 'academic',
    'project documents': 'projects',
    'certificates': 'certificates',
    'client requirement documents': 'client-documents',
    'resume': 'personal',
    'bills': 'others',
    'others': 'others'
};

/**
 * Ensure all upload subdirectories exist on disk
 */
function ensureUploadDirectories() {
    const subdirs = ['personal', 'academic', 'projects', 'certificates', 'client-documents', 'others'];
    if (!fs.existsSync(UPLOADS_BASE_DIR)) {
        fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
    }
    for (const subdir of subdirs) {
        const dirPath = path.join(UPLOADS_BASE_DIR, subdir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

/**
 * Get subdirectory name based on category name or slug
 */
function getCategorySubdirectory(categoryName = '') {
    const key = (categoryName || '').trim().toLowerCase();
    return CATEGORY_SUBDIR_MAP[key] || 'others';
}

module.exports = {
    UPLOADS_BASE_DIR,
    ensureUploadDirectories,
    getCategorySubdirectory
};
