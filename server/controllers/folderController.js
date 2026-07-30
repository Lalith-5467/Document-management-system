const FolderModel = require('../models/folderModel');

class FolderController {
    /**
     * GET /api/folders
     */
    static async getAllFolders(req, res) {
        try {
            const userId = req.user.id;
            const folders = await FolderModel.getAllByUserId(userId);
            return res.status(200).json({
                success: true,
                count: folders.length,
                folders
            });
        } catch (err) {
            console.error('[FolderController] Error getting folders:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve folders.',
                error: err.message
            });
        }
    }

    /**
     * POST /api/folders
     */
    static async createFolder(req, res) {
        try {
            const userId = req.user.id;
            const { folder_name, name, description, color, icon_name, icon } = req.body;
            const folderName = folder_name || name;

            if (!folderName || folderName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Folder name is required.'
                });
            }

            const newFolder = await FolderModel.create({
                userId,
                folder_name: folderName,
                description,
                color,
                icon_name: icon_name || icon
            });

            return res.status(201).json({
                success: true,
                message: 'Folder created successfully!',
                folder: newFolder
            });
        } catch (err) {
            console.error('[FolderController] Error creating folder:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create folder.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/folders/:id
     */
    static async updateFolder(req, res) {
        try {
            const userId = req.user.id;
            const folderId = req.params.id;
            const { folder_name, name, description, color, icon_name, icon } = req.body;
            const folderName = folder_name !== undefined ? folder_name : name;

            if (folderName !== undefined && folderName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Folder name cannot be empty.'
                });
            }

            const updatedFolder = await FolderModel.update(folderId, userId, {
                folder_name: folderName,
                description,
                color,
                icon_name: icon_name || icon
            });

            if (!updatedFolder) {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found or unauthorized.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Folder updated successfully!',
                folder: updatedFolder
            });
        } catch (err) {
            console.error('[FolderController] Error updating folder:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update folder.',
                error: err.message
            });
        }
    }

    /**
     * DELETE /api/folders/:id
     */
    static async deleteFolder(req, res) {
        try {
            const userId = req.user.id;
            const folderId = req.params.id;

            const result = await FolderModel.delete(folderId, userId);
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Folder deleted successfully.'
            });
        } catch (err) {
            console.error('[FolderController] Error deleting folder:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete folder.',
                error: err.message
            });
        }
    }
}

module.exports = FolderController;
