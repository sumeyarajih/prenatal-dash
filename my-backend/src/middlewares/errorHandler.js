const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join(', ');
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `A record with this ${field} already exists.`;
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired.';
    }

    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
        return res.status(statusCode).json({
            success: false,
            message,
            stack: err.stack,
        });
    }

    res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
