const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── POST /api/v1/notifications/send ──────────────────────────────────────────
exports.sendNow = async (req, res, next) => {
    try {
        const {
            title, body, type,
            targetLanguage = 'all',
            targetTrimester = 0,
        } = req.body;

        // Persist notification record
        const notification = await Notification.create({
            title,
            body,
            type,
            targetLanguage,
            targetTrimester,
            status: 'sent',
            sentAt: new Date(),
            createdBy: req.admin._id,
        });

        // Send via FCM
        const titleStr = title?.[targetLanguage] || title?.am || 'Notification';
        const bodyStr = body?.[targetLanguage] || body?.am || '';

        const result = await notificationService.sendToAll(
            targetLanguage,
            targetTrimester,
            titleStr,
            bodyStr
        );

        notification.sentCount = result.sentCount || 0;
        await notification.save();

        return sendSuccess(res, 200, 'Notifications sent', { notification, fcmResult: result });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/notifications/schedule ──────────────────────────────────────
exports.schedule = async (req, res, next) => {
    try {
        const { title, body, type, targetLanguage, targetTrimester, scheduledAt } = req.body;

        if (!scheduledAt) return sendError(res, 400, 'scheduledAt is required for scheduling.');

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return sendError(res, 400, 'scheduledAt must be a future date.');
        }

        const notification = await Notification.create({
            title,
            body,
            type,
            targetLanguage: targetLanguage || 'all',
            targetTrimester: targetTrimester || 0,
            scheduledAt: scheduledDate,
            status: 'scheduled',
            createdBy: req.admin._id,
        });

        return sendSuccess(res, 201, 'Notification scheduled', notification);
    } catch (err) {
        next(err);
    }
};

// ── GET /api/v1/notifications/history ────────────────────────────────────────
exports.getHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Notification.countDocuments(filter);
        const items = await Notification.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, items, page, limit, total);
    } catch (err) {
        next(err);
    }
};
