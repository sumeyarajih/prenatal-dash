require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Smart Pregnancy API Server running on port ${PORT}`);
        console.log(`📡 Environment: ${process.env.NODE_ENV}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health\n`);
    });
}).catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
