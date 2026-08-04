const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production & Development CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigin : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const folderRoutes = require('./routes/folderRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reportRoutes = require('./routes/reportRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const settingRoutes = require('./routes/settingRoutes');
const themeRoutes = require('./routes/themeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/themes', themeRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'Document Management System API is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// Supabase Storage Health Check Endpoint
app.get('/api/supabase-health', async (req, res) => {
    try {
        const supabase = require('./config/supabase');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        const bucketName = process.env.SUPABASE_BUCKET || 'documents';

        // Check if credentials are configured
        if (!supabaseUrl || !supabaseKey ||
            supabaseUrl.includes('your-project-id') ||
            supabaseKey.includes('your-supabase-service-role-key')) {
            return res.status(200).json({
                status: 'not_configured',
                connected: false,
                storageMode: 'Local Disk (server/uploads/)',
                message: 'Supabase credentials are not configured in server/.env file. Currently using local disk storage.',
                hint: 'Add SUPABASE_URL and SUPABASE_SERVICE_KEY to server/.env to activate cloud storage.',
                timestamp: new Date().toISOString()
            });
        }

        if (!supabase) {
            return res.status(500).json({
                status: 'error',
                connected: false,
                message: 'Supabase client failed to initialize. Check your credentials.',
                timestamp: new Date().toISOString()
            });
        }

        // List buckets to verify connection
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            return res.status(500).json({
                status: 'error',
                connected: false,
                message: `Supabase connection failed: ${listError.message}`,
                hint: 'Verify your SUPABASE_URL and SUPABASE_SERVICE_KEY are correct.',
                timestamp: new Date().toISOString()
            });
        }

        // Check if target bucket exists
        const bucketExists = buckets.some(b => b.name === bucketName);

        // List files in bucket
        let fileCount = 0;
        if (bucketExists) {
            const { data: files } = await supabase.storage.from(bucketName).list('', { limit: 100 });
            fileCount = files ? files.length : 0;
        }

        return res.status(200).json({
            status: 'connected',
            connected: true,
            storageMode: 'Supabase Cloud Storage ☁️',
            supabaseUrl: supabaseUrl,
            bucket: bucketName,
            bucketExists: bucketExists,
            fileCount: fileCount,
            availableBuckets: buckets.map(b => b.name),
            message: bucketExists
                ? `✅ Supabase Storage is connected and bucket "${bucketName}" is ready!`
                : `⚠️ Connected to Supabase but bucket "${bucketName}" does not exist. Please create it in the Supabase Dashboard.`,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        return res.status(500).json({
            status: 'error',
            connected: false,
            message: `Supabase health check error: ${err.message}`,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found.'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start Server with EADDRINUSE resilience
const startServer = (portToUse) => {
    const server = app.listen(portToUse, async () => {
        console.log(`=================================================`);
        console.log(`🚀 Server running on http://localhost:${portToUse}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`=================================================`);
        await testConnection();
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️ Port ${portToUse} is currently in use, retrying in 1 second...`);
            setTimeout(() => {
                server.close();
                startServer(portToUse);
            }, 1000);
        } else {
            console.error('Server startup error:', err);
        }
    });
};

startServer(PORT);
