const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ────────────────────────────────────────────
// Security Middlewares
// ────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting: 100 req per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ────────────────────────────────────────────
// Body Parsing & Logging
// ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ────────────────────────────────────────────
// API Routes (v1)
// ────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const fetalRoutes = require('./routes/fetal.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const sleepRoutes = require('./routes/sleep.routes');
const musicRoutes = require('./routes/music.routes');
const notificationRoutes = require('./routes/notification.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const adminRoutes = require('./routes/admin.routes');
const trackerRoutes = require('./routes/tracker.routes');
const healthTipRoutes = require('./routes/healthTip.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/fetal', fetalRoutes);
app.use('/api/v1/exercise', exerciseRoutes);
app.use('/api/v1/sleep', sleepRoutes);
app.use('/api/v1/music', musicRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/tracker', trackerRoutes);
app.use('/api/v1/health-tips', healthTipRoutes);

// ────────────────────────────────────────────
// Health Check
// ────────────────────────────────────────────
const mongoose = require('mongoose');
app.get('/api/v1/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({
        success: true,
        status: 'OK',
        server: 'Smart Pregnancy API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: {
            status: statusMap[dbStatus] || 'unknown',
            connected: dbStatus === 1,
        },
        environment: process.env.NODE_ENV,
    });
});

// ────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ────────────────────────────────────────────
// Global Error Handler
// ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
