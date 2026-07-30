const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureUploadDirectories, UPLOADS_BASE_DIR, getCategorySubdirectory } = require('../utils/fileUtils');

// Determine storage mode: Supabase Cloud or Local Disk
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY &&
    !process.env.SUPABASE_URL.includes('your-project-id'));

let storage;

if (useSupabase) {
    // Supabase mode: store file in memory buffer, upload to cloud in controller
    storage = multer.memoryStorage();
    console.log('☁️  File storage mode: Supabase Cloud Storage');
} else {
    // Local disk mode: store categorized files on server hard drive
    ensureUploadDirectories();
    storage = multer.diskStorage({
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
    console.log('💾  File storage mode: Local Disk (server/uploads/)');
}

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|pdf|doc|docx|txt|zip|xlsx|pptx/;
    const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    if (extName || file.mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file format. Only PDF, DOC, DOCX, Images, TXT, Excel, PPT, and ZIP files are allowed!'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max per file
    fileFilter
});

module.exports = { upload, useSupabase };
