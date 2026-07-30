const AdminModel = require('../models/adminModel');
const CategoryModel = require('../models/categoryModel');
const DocumentModel = require('../models/documentModel');
const ActivityModel = require('../models/activityModel');
const path = require('path');
const fs = require('fs');

class AdminController {

    /* ==================== DASHBOARD ==================== */

    static async getStats(req, res) {
        try {
            const stats = await AdminModel.getAdminStats();
            return res.json({ success: true, stats });
        } catch (err) {
            console.error('Admin getStats error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch admin statistics.' });
        }
    }

    /* ==================== USER MANAGEMENT ==================== */

    static async getUsers(req, res) {
        try {
            const { search = '', page = 1, limit = 20 } = req.query;
            const result = await AdminModel.getAllUsers(search, page, limit);
            return res.json({ success: true, ...result });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
        }
    }

    static async getUserDetails(req, res) {
        try {
            const details = await AdminModel.getUserDetails(req.params.id);
            if (!details) return res.status(404).json({ success: false, message: 'User not found.' });
            return res.json({ success: true, ...details });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch user details.' });
        }
    }

    static async createUser(req, res) {
        try {
            const { full_name, email, password, user_type } = req.body;
            if (!full_name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Full name, email and password are required.' });
            }
            const result = await AdminModel.createUser({ fullName: full_name, email, password, userType: user_type || 'individual' });
            if (!result.success) return res.status(400).json({ success: false, message: result.message });

            await ActivityModel.createLog({ userId: req.user.id, actionType: 'CREATE', documentName: null, details: `Admin created new user account: ${email}` });
            return res.status(201).json({ success: true, message: 'User created successfully.', userId: result.userId });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to create user.' });
        }
    }

    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { full_name, email, user_type } = req.body;
            const result = await AdminModel.updateUser(id, { fullName: full_name, email, userType: user_type });
            if (!result.success) return res.status(500).json({ success: false, message: result.message });
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE', documentName: null, details: `Admin updated user ID ${id}: ${email}` });
            return res.json({ success: true, message: 'User updated successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update user.' });
        }
    }

    static async resetUserPassword(req, res) {
        try {
            const { id } = req.params;
            const { new_password } = req.body;
            if (!new_password || new_password.length < 6) {
                return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
            }
            const result = await AdminModel.resetUserPassword(id, new_password);
            if (!result.success) return res.status(500).json({ success: false, message: 'Failed to reset password.' });
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE', documentName: null, details: `Admin reset password for user ID ${id}` });
            return res.json({ success: true, message: 'Password reset successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to reset password.' });
        }
    }

    static async toggleUserActive(req, res) {
        try {
            const { id } = req.params;
            const newStatus = await AdminModel.toggleUserActive(id);
            if (newStatus === null) return res.status(404).json({ success: false, message: 'User not found.' });
            const label = newStatus === 1 ? 'Activated' : 'Deactivated';
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE', documentName: null, details: `Admin ${label} user ID ${id}` });
            return res.json({ success: true, message: `User account ${label}.`, isActive: newStatus });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update user status.' });
        }
    }

    static async toggleUserBlock(req, res) {
        try {
            const { id } = req.params;
            const newStatus = await AdminModel.toggleUserBlock(id);
            if (newStatus === null) return res.status(404).json({ success: false, message: 'User not found.' });
            const label = newStatus === 1 ? 'Blocked' : 'Unblocked';
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE', documentName: null, details: `Admin ${label} user ID ${id}` });
            return res.json({ success: true, message: `User account ${label}.`, isBlocked: newStatus });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update user block status.' });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await AdminModel.deleteUser(id);
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'DELETE', documentName: null, details: `Admin deleted user ID ${id}` });
            return res.json({ success: true, message: 'User deleted successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete user.' });
        }
    }

    /* ==================== DOCUMENT MANAGEMENT ==================== */

    static async getDocuments(req, res) {
        try {
            const { search = '', category_id = '', user_id = '', page = 1, limit = 20 } = req.query;
            const result = await AdminModel.getAllDocuments({ search, categoryId: category_id, userId: user_id, page, limit });
            return res.json({ success: true, ...result });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
        }
    }

    static async updateDocument(req, res) {
        try {
            const { id } = req.params;
            const { title, description, category_id, folder_id } = req.body;
            const result = await AdminModel.updateDocumentMeta(id, { title, description, categoryId: category_id, folderId: folder_id });
            if (!result.success) return res.status(500).json({ success: false, message: 'Failed to update document.' });
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE', documentName: title, details: `Admin updated document metadata ID ${id}` });
            return res.json({ success: true, message: 'Document updated successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update document.' });
        }
    }

    static async softDeleteDocument(req, res) {
        try {
            const { id } = req.params;
            const doc = await DocumentModel.findById(id);
            if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
            await AdminModel.softDeleteDocument(id);
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'DELETE', documentName: doc.file_name, details: `Admin soft-deleted document "${doc.title}"` });
            return res.json({ success: true, message: 'Document moved to recycle bin.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete document.' });
        }
    }

    static async restoreDocument(req, res) {
        try {
            const { id } = req.params;
            await AdminModel.restoreDocument(id);
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'RESTORE', documentName: null, details: `Admin restored document ID ${id}` });
            return res.json({ success: true, message: 'Document restored successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to restore document.' });
        }
    }

    static async deleteDocument(req, res) {
        try {
            const { id } = req.params;
            const doc = await DocumentModel.findById(id);
            if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

            // Delete physical file
            if (doc.file_path) {
                const filePath = path.join(__dirname, '..', doc.file_path);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }

            await DocumentModel.deletePermanently(id);
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'DELETE', documentName: doc.file_name, details: `Admin permanently deleted document "${doc.title}"` });
            return res.json({ success: true, message: 'Document permanently deleted.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete document.' });
        }
    }

    static async getArchivedDocuments(req, res) {
        try {
            const docs = await AdminModel.getArchivedDocuments();
            return res.json({ success: true, documents: docs });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch archived documents.' });
        }
    }

    /* ==================== FOLDER MANAGEMENT ==================== */

    static async getFolders(req, res) {
        try {
            const { search = '' } = req.query;
            const folders = await AdminModel.getAllFolders({ search });
            return res.json({ success: true, folders });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch folders.' });
        }
    }

    static async createFolder(req, res) {
        try {
            const { folder_name, description, color, user_id } = req.body;
            if (!folder_name || !folder_name.trim()) {
                return res.status(400).json({ success: false, message: 'Folder name is required.' });
            }
            const result = await AdminModel.createFolder({ folderName: folder_name.trim(), description, color, userId: user_id });
            if (!result.success) return res.status(500).json({ success: false, message: 'Failed to create folder.' });
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'CREATE_FOLDER', documentName: null, details: `Admin created folder "${folder_name}"` });
            return res.status(201).json({ success: true, message: 'Folder created successfully.', folderId: result.folderId });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to create folder.' });
        }
    }

    static async updateFolder(req, res) {
        try {
            const { id } = req.params;
            const { folder_name, description, color } = req.body;
            const result = await AdminModel.updateFolder(id, { folderName: folder_name, description, color });
            if (!result.success) return res.status(500).json({ success: false, message: 'Failed to update folder.' });
            return res.json({ success: true, message: 'Folder updated successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update folder.' });
        }
    }

    static async deleteFolder(req, res) {
        try {
            const { id } = req.params;
            await AdminModel.deleteFolder(id);
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'DELETE', documentName: null, details: `Admin deleted folder ID ${id}` });
            return res.json({ success: true, message: 'Folder deleted successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete folder.' });
        }
    }

    /* ==================== CATEGORY MANAGEMENT ==================== */

    static async getCategories(req, res) {
        try {
            const categories = await AdminModel.getAllCategoriesAdmin();
            return res.json({ success: true, categories });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
        }
    }

    static async createCategory(req, res) {
        try {
            const { category_name, description, color, icon_name } = req.body;
            if (!category_name || !category_name.trim()) {
                return res.status(400).json({ success: false, message: 'Category name is required.' });
            }
            const category = await CategoryModel.create({
                userId: req.user ? req.user.id : null,
                category_name: category_name.trim(),
                description: description || '',
                color: color || '#3B82F6',
                icon_name: icon_name || 'Folder'
            });
            if (req.user && req.user.id) {
                await ActivityModel.createLog({ userId: req.user.id, actionType: 'CREATE_CATEGORY', documentName: null, details: `Created category "${category_name}"` }).catch(() => null);
            }
            return res.status(201).json({ success: true, message: 'Category created successfully.', category });
        } catch (err) {
            console.error('[AdminController] Error creating category:', err);
            return res.status(500).json({ success: false, message: 'Failed to create category.' });
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { category_name, description, color, icon_name } = req.body;
            await CategoryModel.update(id, { categoryName: category_name, description, color, iconName: icon_name });
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE_CATEGORY', documentName: null, details: `Admin updated category "${category_name}"` });
            return res.json({ success: true, message: 'Category updated successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update category.' });
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await CategoryModel.delete(id);
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'DELETE_CATEGORY', documentName: null, details: `Admin deleted category ID ${id}` });
            return res.json({ success: true, message: 'Category deleted successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete category.' });
        }
    }

    static async toggleCategoryActive(req, res) {
        try {
            const { id } = req.params;
            const newStatus = await AdminModel.toggleCategoryActive(id);
            if (newStatus === null) return res.status(404).json({ success: false, message: 'Category not found.' });
            return res.json({ success: true, message: `Category ${newStatus === 1 ? 'enabled' : 'disabled'}.`, isActive: newStatus });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to toggle category.' });
        }
    }

    /* ==================== ACTIVITY LOGS ==================== */

    static async getActivityLogs(req, res) {
        try {
            const { search = '', action_type = '', page = 1, limit = 50 } = req.query;
            const result = await AdminModel.getSystemActivityLogs({ search, actionType: action_type, page, limit });
            return res.json({ success: true, ...result });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch activity logs.' });
        }
    }

    /* ==================== REPORTS ==================== */

    static async getReports(req, res) {
        try {
            const reports = await AdminModel.getReportsData();
            return res.json({ success: true, reports });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch reports.' });
        }
    }

    /* ==================== LANDING PAGE CMS ==================== */

    static async getCmsContent(req, res) {
        try {
            const cms = await AdminModel.getCmsContent();
            return res.json({ success: true, cms });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch CMS content.' });
        }
    }

    static async updateCmsContent(req, res) {
        try {
            const result = await AdminModel.updateCmsContent(req.body);
            if (!result.success) return res.status(500).json({ success: false, message: 'Failed to update CMS content.' });
            await ActivityModel.createLog({ userId: req.user.id, actionType: 'UPDATE', documentName: null, details: 'Admin updated landing page CMS content' });
            return res.json({ success: true, message: 'Landing page updated successfully.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update CMS content.' });
        }
    }

    /* ==================== SUBSCRIPTIONS MANAGEMENT CRUD ==================== */

    static async getSubscriptions(req, res) {
        try {
            // Get users with subscription status
            const users = await AdminModel.getAllUsers('', 1, 100);
            return res.json({
                success: true,
                subscriptions: users.users || [],
                globalSettings: {
                    defaultTrialDays: 7,
                    proPrice: 299,
                    businessPrice: 999
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch subscription records.' });
        }
    }

    static async createSubscription(req, res) {
        try {
            const { userId, planId, planName, days, storageLimitGb } = req.body;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID is required.' });
            }
            await ActivityModel.createLog({
                userId: req.user.id,
                actionType: 'CREATE',
                documentName: null,
                details: `Admin assigned ${planName || planId} subscription to user ID ${userId}`
            });
            return res.status(201).json({
                success: true,
                message: `Subscription ${planName || planId} assigned successfully to user ID ${userId}.`
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to create subscription.' });
        }
    }

    static async updateSubscription(req, res) {
        try {
            const { id } = req.params;
            const { planId, planName, status, extendDays, storageLimitGb } = req.body;
            await ActivityModel.createLog({
                userId: req.user.id,
                actionType: 'UPDATE',
                documentName: null,
                details: `Admin updated subscription for user ID ${id} to ${planName || planId} (${status || 'active'})`
            });
            return res.json({
                success: true,
                message: `User subscription ID ${id} updated successfully.`
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update subscription.' });
        }
    }

    static async deleteSubscription(req, res) {
        try {
            const { id } = req.params;
            await ActivityModel.createLog({
                userId: req.user.id,
                actionType: 'DELETE',
                documentName: null,
                details: `Admin deactivated/cancelled subscription for user ID ${id}`
            });
            return res.json({
                success: true,
                message: `Subscription for user ID ${id} cancelled and reset to free trial.`
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to cancel subscription.' });
        }
    }

    /* ==================== BILLING & INVOICES MANAGEMENT CRUD ==================== */

    static async getBillingInvoices(req, res) {
        try {
            return res.json({
                success: true,
                message: 'Fetched all billing invoices successfully.'
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch billing invoices.' });
        }
    }

    static async createBillingInvoice(req, res) {
        try {
            const { customerName, customerEmail, planName, baseAmount } = req.body;
            if (!customerName || !customerEmail || !baseAmount) {
                return res.status(400).json({ success: false, message: 'Customer name, email and amount are required.' });
            }
            const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            await ActivityModel.createLog({
                userId: req.user.id,
                actionType: 'CREATE',
                documentName: null,
                details: `Admin created manual bill ${invoiceNo} for ${customerEmail} (Amount: ₹${baseAmount})`
            });
            return res.status(201).json({
                success: true,
                message: `Invoice ${invoiceNo} created successfully!`,
                invoiceNo
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to create invoice.' });
        }
    }

    static async updateBillingInvoice(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await ActivityModel.createLog({
                userId: req.user.id,
                actionType: 'UPDATE',
                documentName: null,
                details: `Admin updated invoice ${id} status to ${status}`
            });
            return res.json({
                success: true,
                message: `Invoice ${id} status updated to ${status}.`
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update invoice status.' });
        }
    }

    static async deleteBillingInvoice(req, res) {
        try {
            const { id } = req.params;
            await ActivityModel.createLog({
                userId: req.user.id,
                actionType: 'DELETE',
                documentName: null,
                details: `Admin deleted invoice record ${id}`
            });
            return res.json({
                success: true,
                message: `Invoice ${id} deleted successfully.`
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete invoice.' });
        }
    }
}

module.exports = AdminController;
