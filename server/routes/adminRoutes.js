const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const SettingController = require('../controllers/settingController');
const authenticateToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

// All admin routes require valid JWT token AND admin role
router.use(authenticateToken, requireAdmin);

// ======================== DASHBOARD ========================
router.get('/stats', AdminController.getStats);

// ======================== USER MANAGEMENT ========================
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.get('/users/:id', AdminController.getUserDetails);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.patch('/users/:id/toggle-active', AdminController.toggleUserActive);
router.patch('/users/:id/toggle-block', AdminController.toggleUserBlock);
router.patch('/users/:id/reset-password', AdminController.resetUserPassword);

// ======================== DOCUMENT MANAGEMENT ========================
router.get('/documents', AdminController.getDocuments);
router.get('/documents/archived', AdminController.getArchivedDocuments);
router.put('/documents/:id', AdminController.updateDocument);
router.patch('/documents/:id/soft-delete', AdminController.softDeleteDocument);
router.patch('/documents/:id/restore', AdminController.restoreDocument);
router.delete('/documents/:id', AdminController.deleteDocument);

// ======================== FOLDER MANAGEMENT ========================
router.get('/folders', AdminController.getFolders);
router.post('/folders', AdminController.createFolder);
router.put('/folders/:id', AdminController.updateFolder);
router.delete('/folders/:id', AdminController.deleteFolder);

// ======================== CATEGORY MANAGEMENT ========================
router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);
router.patch('/categories/:id/toggle-active', AdminController.toggleCategoryActive);

// ======================== ACTIVITY LOGS ========================
router.get('/activity-logs', AdminController.getActivityLogs);

// ======================== REPORTS ========================
router.get('/reports', AdminController.getReports);

// ======================== LANDING PAGE CMS ========================
router.get('/cms', AdminController.getCmsContent);
router.put('/cms', AdminController.updateCmsContent);

// ======================== SUBSCRIPTION MANAGEMENT CRUD ========================
router.get('/subscriptions', AdminController.getSubscriptions);
router.post('/subscriptions', AdminController.createSubscription);
router.put('/subscriptions/:id', AdminController.updateSubscription);
router.delete('/subscriptions/:id', AdminController.deleteSubscription);

// ======================== BILLING & INVOICES CRUD ========================
router.get('/billing', AdminController.getBillingInvoices);
router.post('/billing', AdminController.createBillingInvoice);
router.put('/billing/:id', AdminController.updateBillingInvoice);
router.delete('/billing/:id', AdminController.deleteBillingInvoice);

module.exports = router;
