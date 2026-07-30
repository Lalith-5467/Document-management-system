const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');
const authenticateToken = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

// GET categories, stats, downloads & trash
router.get('/categories', DocumentController.getCategories);
router.get('/stats', DocumentController.getDashboardStats);
router.get('/downloads/history', DocumentController.getDownloadHistory);
router.get('/trash', DocumentController.getTrashDocuments);

// POST upload file
router.post('/upload', upload.single('document'), DocumentController.uploadDocument);

// GET download & preview & stream files
router.get('/:id/download', DocumentController.downloadDocument);
router.get('/:id/preview', DocumentController.getPreviewDetails);
router.get('/:id/stream', DocumentController.streamDocumentFile);

// PATCH toggle favorite / archive / restore / rename / move
router.patch('/:id/favorite', DocumentController.toggleFavorite);
router.patch('/:id/archive', DocumentController.toggleArchive);
router.patch('/:id/restore', DocumentController.restoreDocument);
router.patch('/:id/rename', DocumentController.renameDocument);
router.patch('/:id/move', DocumentController.moveDocument);

// GET list & search documents
router.get('/', DocumentController.getAllDocuments);

// GET single document details
router.get('/:id', DocumentController.getDocumentById);

// PUT update document details
router.put('/:id', DocumentController.updateDocument);

// DELETE trash empty, permanent delete & soft delete
router.delete('/trash/empty', DocumentController.emptyTrash);
router.delete('/:id/permanent', DocumentController.permanentDeleteDocument);
router.delete('/:id', DocumentController.deleteDocument);

module.exports = router;
