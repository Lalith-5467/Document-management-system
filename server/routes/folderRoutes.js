const express = require('express');
const router = express.Router();
const FolderController = require('../controllers/folderController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// GET all folders
router.get('/', FolderController.getAllFolders);

// POST create folder
router.post('/', FolderController.createFolder);

// PUT update folder
router.put('/:id', FolderController.updateFolder);

// DELETE folder
router.delete('/:id', FolderController.deleteFolder);

module.exports = router;
