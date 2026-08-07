const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureUploadDirectories, UPLOADS_BASE_DIR, getCategorySubdirectory } = require('../utils/fileUtils');

// Ensure local upload directories exist on server startup
ensureUploadDirectories();

// Always use diskStorage so physical files are preserved in server/uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const categoryName = req.body.categoryName || req.body.category_name || '';
        const targetSubdir = getCategorySubdirectory(categoryName);
        const targetDirPath = path.join(UPLOADS_BASE_DIR, targetSubdir);
        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }
        cb(null, targetDirPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(cleanName);
        const baseName = path.basename(cleanName, ext);
        cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Block executable script files for security
    const dangerousExtensions = /\.(exe|bat|cmd|sh|vbs|js|scr|msi|dll|jar)$/i;
    if (dangerousExtensions.test(file.originalname)) {
        return cb(new Error('Executable script files (.exe, .bat, .sh) are not allowed for security reasons.'));
    }
    // Accept all documents, images, office files, presentations, spreadsheets, archives, and text files
    return cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max per file
    fileFilter
});

const useSupabase = false;

module.exports = { upload, useSupabase };
