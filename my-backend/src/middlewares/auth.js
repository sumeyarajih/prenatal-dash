const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const auth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendError(res, 401, 'Access denied. No token provided.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return sendError(res, 401, 'Token is invalid. User not found.');
        }

        if (!user.isActive) {
            return sendError(res, 403, 'Your account has been deactivated.');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return sendError(res, 401, 'Invalid token.');
        }
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 401, 'Token has expired. Please login again.');
        }
        next(err);
    }
};

module.exports = auth;
