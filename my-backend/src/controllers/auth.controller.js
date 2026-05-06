const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getPregnancyProgress } = require('../services/pregnancyCalculator');

// ── Generate JWT ─────────────────────────────────────────────────────────────
const signToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

// ── POST /api/v1/auth/register ───────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { phone, name, language, lmpDate, password } = req.body;

        const existing = await User.findOne({ phone });
        if (existing) {
            return sendError(res, 409, 'A user with this phone number already exists.');
        }

        const user = await User.create({ phone, name, language, lmpDate, password });

        const token = signToken(user._id);
        const progress = user.lmpDate ? getPregnancyProgress(user.lmpDate) : null;

        return sendSuccess(res, 201, 'Registration successful', {
            token,
            user: { ...user.toJSON(), ...progress },
        });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/auth/login ──────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone }).select('+password');
        if (!user) {
            return sendError(res, 401, 'Invalid credentials.');
        }

        if (!user.isActive) {
            return sendError(res, 403, 'Your account has been deactivated.');
        }

        // If password is set, verify it; otherwise allow OTP-style (phone-only) login
        if (user.password && password) {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) return sendError(res, 401, 'Invalid credentials.');
        }

        const token = signToken(user._id);
        const progress = user.lmpDate ? getPregnancyProgress(user.lmpDate) : null;

        return sendSuccess(res, 200, 'Login successful', {
            token,
            user: { ...user.toJSON(), ...progress },
        });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/auth/admin/login ────────────────────────────────────────────
exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return sendError(res, 401, 'Invalid admin credentials.');
        }

        if (!admin.isActive) {
            return sendError(res, 403, 'Admin account is deactivated.');
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid admin credentials.');
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        return sendSuccess(res, 200, 'Admin login successful', { token, admin });
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/v1/auth/fcm-token ───────────────────────────────────────────────
exports.updateFcmToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return sendError(res, 400, 'FCM token is required.');
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { fcmToken },
            { new: true }
        );

        return sendSuccess(res, 200, 'FCM token updated', { fcmToken: user.fcmToken });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/auth/admin/register (seeding / internal) ───────────────────
exports.adminRegister = async (req, res, next) => {
    try {
        const { name, email, password, secret } = req.body;

        if (secret !== process.env.ADMIN_REGISTRATION_SECRET) {
            return sendError(res, 403, 'Invalid registration secret.');
        }

        const existing = await Admin.findOne({ email });
        if (existing) {
            return sendError(res, 409, 'Admin with this email already exists.');
        }

        const admin = await Admin.create({ name, email, password });

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );

        return sendSuccess(res, 201, 'Admin created successfully', { token, admin });
    } catch (err) {
        next(err);
    }
};
