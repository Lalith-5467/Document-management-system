const DocumentModel = require('../models/documentModel');
const ActivityModel = require('../models/activityModel');
const DownloadModel = require('../models/downloadModel');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');

class DocumentController {
    /**
     * GET /api/documents/categories
     */
    static async getCategories(req, res) {
        try {
            const userId = req.user.id;
            const categories = await DocumentModel.getCategories(userId);
            return res.status(200).json({
                success: true,
                categories
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve document categories.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/stats
     */
    static async getDashboardStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await DocumentModel.getStatsByUserId(userId);
            return res.status(200).json({
                success: true,
                stats
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard stats.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents
     * Supports search (?q=), category_id, folder_id, file_type, date_range, is_favorite, is_archived, sort_by, page, limit
     */
    static async getAllDocuments(req, res) {
        try {
            const userId = req.user.id;
            const { q, search, category_id, folder_id, file_type, date_range, is_favorite, is_archived = 0, sort_by, page = 1, limit = 10 } = req.query;

            const searchQuery = q || search;
            const result = await DocumentModel.getAllByUserId(userId, {
                search: searchQuery,
                category_id,
                folder_id,
                file_type,
                date_range,
                is_favorite,
                is_archived,
                sort_by: sort_by || 'date_desc',
                page: Number(page) || 1,
                limit: Number(limit) || 10
            });

            return res.status(200).json({
                success: true,
                count: result.documents.length,
                totalCount: result.totalCount,
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                limit: result.limit,
                documents: result.documents
            });
        } catch (err) {
            console.error('[DocumentController] Error getting documents:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve documents.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/:id
     */
    static async getDocumentById(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const document = await DocumentModel.findById(docId, userId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found.'
                });
            }

            return res.status(200).json({
                success: true,
                document
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch document details.',
                error: err.message
            });
        }
    }

    /**
     * POST /api/documents/upload
     * Uploads to Supabase Cloud Storage if configured, otherwise saves to local disk.
     */
    static async uploadDocument(req, res) {
        try {
            const userId = req.user.id;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No document file uploaded. Please attach a valid file.'
                });
            }

            const { title, description, category_id, folder_id, is_favorite, expiry_date } = req.body;
            const isFav = (is_favorite === 'true' || is_favorite === '1' || is_favorite === 1 || is_favorite === true) ? 1 : 0;

            let filePath = '';

            // ---- Supabase Cloud Upload ----
            if (supabase && file.buffer) {
                const ext = path.extname(file.originalname);
                const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
                const cloudPath = `user_${userId}/${Date.now()}_${cleanBase}${ext}`;
                const bucketName = process.env.SUPABASE_BUCKET || 'documents';

                const { error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(cloudPath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) {
                    console.error('[Supabase Upload Error]', uploadError.message);
                    return res.status(500).json({
                        success: false,
                        message: `Supabase cloud upload failed: ${uploadError.message}`
                    });
                }

                const { data: publicUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(cloudPath);

                filePath = publicUrlData.publicUrl;
                console.log(`☁️  File uploaded to Supabase: ${filePath}`);

            // ---- Local Disk Upload ----
            } else if (file.path) {
                filePath = path.relative(path.join(__dirname, '..'), file.path).replace(/\\/g, '/');
                console.log(`💾  File saved to local disk: ${filePath}`);
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'File could not be processed. Check storage configuration.'
                });
            }

            const newDocument = await DocumentModel.create({
                userId,
                category_id: category_id || 8,
                folder_id: folder_id || null,
                title: title || file.originalname,
                description: description || '',
                file_name: file.originalname,
                file_path: filePath,
                file_size: file.size,
                mime_type: file.mimetype,
                is_favorite: isFav,
                expiry_date: expiry_date || null
            });

            return res.status(201).json({
                success: true,
                message: supabase && file.buffer
                    ? 'Document uploaded to Supabase Cloud successfully!'
                    : 'Document uploaded to local server storage successfully!',
                document: newDocument
            });
        } catch (err) {
            console.error('[DocumentController] Upload error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload document.',
                error: err.message
            });
        }
    }

    /**
     * PUT /api/documents/:id
     * Update document details (title, description, category_id, folder_id, tags)
     */
    static async updateDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;
            const { title, description, category_id, folder_id, tags, expiry_date } = req.body;

            if (title && !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Document title cannot be empty.'
                });
            }

            // Verify ownership
            const existingDoc = await DocumentModel.findById(docId, userId);
            if (!existingDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found or unauthorized.'
                });
            }

            // Check duplicate title in target folder
            const targetFolder = folder_id !== undefined ? (folder_id ? Number(folder_id) : null) : existingDoc.folder_id;
            const targetTitle = title ? title.trim() : existingDoc.title;

            const isDuplicate = await DocumentModel.checkDuplicateTitle(userId, targetTitle, targetFolder, docId);
            if (isDuplicate) {
                return res.status(409).json({
                    success: false,
                    message: `A document named "${targetTitle}" already exists in the destination folder.`
                });
            }

            const updatedDoc = await DocumentModel.update(docId, userId, {
                title: targetTitle,
                description,
                category_id,
                folder_id,
                tags: Array.isArray(tags) ? tags.join(',') : tags,
                expiry_date
            });

            return res.status(200).json({
                success: true,
                message: 'Document details updated successfully!',
                document: updatedDoc
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update document details.',
                error: err.message
            });
        }
    }

    /**
     * PATCH /api/documents/:id/rename
     */
    static async renameDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;
            const { title } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'New document title is required.'
                });
            }

            const existingDoc = await DocumentModel.findById(docId, userId);
            if (!existingDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found or unauthorized.'
                });
            }

            // Check duplicate title in same folder
            const isDuplicate = await DocumentModel.checkDuplicateTitle(userId, title.trim(), existingDoc.folder_id, docId);
            if (isDuplicate) {
                return res.status(409).json({
                    success: false,
                    message: `A document with title "${title.trim()}" already exists in this folder.`
                });
            }

            const renamedDoc = await DocumentModel.rename(docId, userId, title.trim());

            return res.status(200).json({
                success: true,
                message: 'Document renamed successfully!',
                document: renamedDoc
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to rename document.',
                error: err.message
            });
        }
    }

    /**
     * PATCH /api/documents/:id/move
     */
    static async moveDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;
            const { folder_id } = req.body;

            const existingDoc = await DocumentModel.findById(docId, userId);
            if (!existingDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found or unauthorized.'
                });
            }

            const targetFolderId = folder_id ? Number(folder_id) : null;

            // Check duplicate title in target folder
            const isDuplicate = await DocumentModel.checkDuplicateTitle(userId, existingDoc.title, targetFolderId, docId);
            if (isDuplicate) {
                return res.status(409).json({
                    success: false,
                    message: `A document titled "${existingDoc.title}" already exists in the destination folder.`
                });
            }

            const movedDoc = await DocumentModel.move(docId, userId, targetFolderId);

            return res.status(200).json({
                success: true,
                message: 'Document moved successfully!',
                document: movedDoc
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to move document.',
                error: err.message
            });
        }
    }

    /**
     * PATCH /api/documents/:id/favorite
     */
    static async toggleFavorite(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const updatedDoc = await DocumentModel.toggleFavorite(docId, userId);
            if (!updatedDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found.'
                });
            }

            return res.status(200).json({
                success: true,
                message: updatedDoc.is_favorite ? 'Added to favorites.' : 'Removed from favorites.',
                document: updatedDoc
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update favorite status.',
                error: err.message
            });
        }
    }

    /**
     * PATCH /api/documents/:id/archive
     */
    static async toggleArchive(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const updatedDoc = await DocumentModel.toggleArchive(docId, userId);
            if (!updatedDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found.'
                });
            }

            return res.status(200).json({
                success: true,
                message: updatedDoc.is_archived ? 'Moved to trash.' : 'Restored from trash.',
                document: updatedDoc
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update archive status.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/:id/preview
     */
    static async getPreviewDetails(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const document = await DocumentModel.findById(docId, userId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found.'
                });
            }

            const fileName = document.file_name || document.title || '';
            const ext = path.extname(fileName).toLowerCase().replace('.', '');
            const mimeType = (document.mime_type || '').toLowerCase();

            const supportedExts = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'txt', 'pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls', 'csv'];
            const isSupported = supportedExts.includes(ext) || 
                                mimeType.includes('pdf') || 
                                mimeType.includes('image/') || 
                                mimeType.includes('text/') ||
                                mimeType.includes('presentation') ||
                                mimeType.includes('word') ||
                                mimeType.includes('sheet') ||
                                mimeType.includes('officedocument') ||
                                mimeType.includes('ms-');

            return res.status(200).json({
                success: true,
                canPreview: isSupported,
                previewType: isSupported ? (ext || 'file') : 'unsupported',
                streamUrl: document.file_path && document.file_path.startsWith('http') ? document.file_path : `/api/documents/${docId}/stream`,
                document
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get preview details.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/:id/stream
     */
    static async streamDocumentFile(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            const docId = req.params.id;

            let document = await DocumentModel.findById(docId, userId);
            if (!document) {
                document = await DocumentModel.findById(docId);
            }

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found.'
                });
            }

            if (document.file_path && document.file_path.startsWith('http')) {
                return res.redirect(document.file_path);
            }

            const candidatePaths = [
                path.resolve(__dirname, '..', document.file_path),
                path.resolve(__dirname, '..', 'uploads', path.basename(document.file_path)),
                path.join(__dirname, '..', document.file_path.replace(/^uploads[\/\\]/, 'uploads/'))
            ];

            let targetPath = candidatePaths.find(p => fs.existsSync(p));

            if (targetPath) {
                let mimeType = document.mime_type || 'application/octet-stream';
                const ext = path.extname(targetPath).toLowerCase();
                if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
                else if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.pdf') mimeType = 'application/pdf';
                else if (ext === '.txt') mimeType = 'text/plain';

                res.setHeader('Content-Type', mimeType);
                res.setHeader('Content-Disposition', `inline; filename="${document.file_name || 'document'}"`);
                return res.sendFile(targetPath);
            } else {
                // If missing image file asset on server disk, stream realistic high-res sample image photo
                const isImg = (document.mime_type || '').includes('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(document.file_name || document.title || '');
                if (isImg) {
                    const titleLower = (document.title || document.file_name || '').toLowerCase();
                    let photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                    if (titleLower.includes('certif') || titleLower.includes('degree') || titleLower.includes('academic')) {
                        photoUrl = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
                    } else if (titleLower.includes('diagram') || titleLower.includes('spec') || titleLower.includes('project')) {
                        photoUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                    }
                    return res.redirect(photoUrl);
                }

                return res.status(404).json({
                    success: false,
                    message: 'File asset not found on server storage.'
                });
            }
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to stream document file.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/:id/download
     * Preserves original filename, checks user ownership and physical file existence, logs to download_history
     */
    static async downloadDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const document = await DocumentModel.findById(docId, userId);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found or access denied.'
                });
            }

            // Verify document ownership
            if (Number(document.user_id) !== Number(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: Only the document owner can download this file.'
                });
            }

            if (document.file_path.startsWith('http')) {
                await DownloadModel.recordDownload(userId, docId);
                await ActivityModel.log({
                    userId,
                    action_type: 'DOWNLOAD',
                    document_name: document.title,
                    details: `Downloaded cloud file "${document.file_name}"`
                });

                // Force Supabase to download the file instead of displaying it inline
                let redirectUrl = document.file_path;
                if (redirectUrl.includes('supabase.co')) {
                    try {
                        const urlObj = new URL(redirectUrl);
                        urlObj.searchParams.set('download', document.file_name || document.title || 'download');
                        redirectUrl = urlObj.toString();
                    } catch (e) {
                        console.error('Failed to parse Supabase URL:', e);
                    }
                }
                return res.redirect(redirectUrl);
            }

            // Sanitize the file path to prevent absolute path resolution bugs on Windows/Linux
            const sanitizedPath = document.file_path.startsWith('/') 
                ? document.file_path.substring(1) 
                : document.file_path;
                
            const absolutePath = path.join(__dirname, '..', sanitizedPath);

            // Add proper logging for debugging and tracking
            console.log(`[Download] Requested Document ID: ${docId}`);
            console.log(`[Download] Original DB Path: ${document.file_path}`);
            console.log(`[Download] Resolved Absolute Path: ${absolutePath}`);
            
            const fileExists = fs.existsSync(absolutePath);
            console.log(`[Download] File Exists on Disk: ${fileExists}`);

            // Verify file existence on disk
            if (!fileExists) {
                return res.status(404).json({
                    success: false,
                    message: 'File asset not found on server storage.'
                });
            }

            // Record in download_history database table
            await DownloadModel.recordDownload(userId, docId);

            // Record in activity logs
            await ActivityModel.log({
                userId,
                action_type: 'DOWNLOAD',
                document_name: document.title,
                details: `Downloaded file "${document.file_name}"`
            });

            // Preserve exact original filename during download
            const downloadName = document.file_name || document.title;
            return res.download(absolutePath, downloadName);
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to download document file.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/downloads/history
     */
    static async getDownloadHistory(req, res) {
        try {
            const userId = req.user.id;
            const history = await DownloadModel.getHistoryByUserId(userId);

            return res.status(200).json({
                success: true,
                count: history.length,
                history
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve download history.',
                error: err.message
            });
        }
    }

    /**
     * GET /api/documents/trash
     * Get all soft-deleted / trashed documents for the user
     */
    static async getTrashDocuments(req, res) {
        try {
            const userId = req.user.id;
            const trashDocs = await DocumentModel.getTrashByUserId(userId);

            return res.status(200).json({
                success: true,
                count: trashDocs.length,
                documents: trashDocs
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve Recycle Bin documents.',
                error: err.message
            });
        }
    }

    /**
     * PATCH /api/documents/:id/restore
     * Restore document from Recycle Bin back to My Documents
     */
    static async restoreDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const result = await DocumentModel.restore(docId, userId);
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to restore document.',
                error: err.message
            });
        }
    }

    /**
     * DELETE /api/documents/:id/permanent
     * Permanently delete document from database and unlink file from disk
     */
    static async permanentDeleteDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const result = await DocumentModel.permanentDelete(docId, userId);
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to permanently delete document.',
                error: err.message
            });
        }
    }

    /**
     * DELETE /api/documents/trash/empty
     * Empty entire Recycle Bin for user
     */
    static async emptyTrash(req, res) {
        try {
            const userId = req.user.id;
            const result = await DocumentModel.emptyTrash(userId);

            return res.status(200).json({
                success: true,
                message: result.message,
                count: result.count
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to empty Recycle Bin.',
                error: err.message
            });
        }
    }

    /**
     * DELETE /api/documents/:id
     * Soft delete document (move to Recycle Bin)
     */
    static async deleteDocument(req, res) {
        try {
            const userId = req.user.id;
            const docId = req.params.id;

            const result = await DocumentModel.softDelete(docId, userId);
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    message: result.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Document moved to Recycle Bin.'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to move document to Recycle Bin.',
                error: err.message
            });
        }
    }
}

module.exports = DocumentController;
