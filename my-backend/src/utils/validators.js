const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('./apiResponse');

// ── Middleware to handle validation results ──────────────────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join('; ');
        return sendError(res, 422, 'Validation failed', errors.array());
    }
    next();
};

// ── Rule sets ────────────────────────────────────────────────────────────────
const registerRules = [
    body('phone').notEmpty().withMessage('Phone is required').trim(),
    body('language').optional().isIn(['am', 'or']).withMessage('Language must be am or or'),
    body('lmpDate').optional().isISO8601().withMessage('lmpDate must be a valid date'),
];

const loginRules = [
    body('phone').notEmpty().withMessage('Phone is required').trim(),
];

const adminLoginRules = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const nutritionRules = [
    body('trimester').isIn([1, 2, 3]).withMessage('Trimester must be 1, 2, or 3'),
    body('title.am').notEmpty().withMessage('Amharic title is required'),
    body('title.or').notEmpty().withMessage('Oromo title is required'),
];

const fetalRules = [
    body('week').isInt({ min: 1, max: 42 }).withMessage('Week must be between 1 and 42'),
];

const musicRules = [
    body('category').isIn(['relaxation', 'meditation', 'lullaby']).withMessage('Invalid category'),
];

const notificationRules = [
    body('type').isIn(['reminder', 'alert', 'tip']).withMessage('Invalid notification type'),
    body('title.am').notEmpty().withMessage('Amharic title is required'),
    body('body.am').notEmpty().withMessage('Amharic body is required'),
];

const emergencyRules = [
    body('hospitalName').notEmpty().withMessage('Hospital name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('city').notEmpty().withMessage('City is required'),
];

const paginationRules = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    adminLoginRules,
    nutritionRules,
    fetalRules,
    musicRules,
    notificationRules,
    emergencyRules,
    paginationRules,
};
