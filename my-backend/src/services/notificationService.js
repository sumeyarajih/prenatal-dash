const { admin } = require('../config/firebase');

/**
 * Send push notification to a single device
 */
const sendToUser = async (fcmToken, title, body, data = {}) => {
    if (!admin || !admin.messaging) {
        console.warn('⚠️  Firebase not initialized. Skipping push notification.');
        return { success: false, reason: 'Firebase not initialized' };
    }

    if (!fcmToken) {
        return { success: false, reason: 'No FCM token provided' };
    }

    try {
        const message = {
            token: fcmToken,
            notification: { title, body },
            data: { ...data },
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default' } } },
        };

        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (err) {
        console.error('FCM sendToUser error:', err.message);
        return { success: false, reason: err.message };
    }
};

/**
 * Send to multiple devices (batch)
 */
const sendToGroup = async (fcmTokens, title, body, data = {}) => {
    if (!admin || !admin.messaging) {
        console.warn('⚠️  Firebase not initialized. Skipping group push.');
        return { success: false, reason: 'Firebase not initialized' };
    }

    const validTokens = fcmTokens.filter(Boolean);
    if (validTokens.length === 0) {
        return { success: false, reason: 'No valid FCM tokens' };
    }

    try {
        const message = {
            notification: { title, body },
            data: { ...data },
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default' } } },
            tokens: validTokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses,
        };
    } catch (err) {
        console.error('FCM sendToGroup error:', err.message);
        return { success: false, reason: err.message };
    }
};

/**
 * Send to all users matching language and/or trimester filter
 * @param {string} language - 'am' | 'or' | 'all'
 * @param {number} trimester - 1|2|3|0 (0=all)
 * @param {string} title
 * @param {string} body
 */
const sendToAll = async (language, trimester, title, body, data = {}) => {
    const User = require('../models/User');

    const filter = { isActive: true, fcmToken: { $exists: true, $ne: null, $ne: '' } };
    if (language !== 'all') filter.language = language;
    if (trimester && trimester !== 0) filter.currentWeek = getTrimesterWeekRange(trimester);

    const users = await User.find(filter).select('fcmToken');
    const tokens = users.map((u) => u.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
        return { success: false, reason: 'No matching users with FCM tokens', sentCount: 0 };
    }

    const result = await sendToGroup(tokens, title, body, data);
    return { ...result, sentCount: tokens.length };
};

const getTrimesterWeekRange = (trimester) => {
    const ranges = {
        1: { $gte: 1, $lte: 13 },
        2: { $gte: 14, $lte: 26 },
        3: { $gte: 27, $lte: 42 },
    };
    return ranges[trimester] || undefined;
};

module.exports = { sendToUser, sendToGroup, sendToAll };
