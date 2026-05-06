const User = require('../models/User');
const NutritionGuide = require('../models/NutritionGuide');
const FetalDevelopment = require('../models/FetalDevelopment');
const Exercise = require('../models/Exercise');
const SleepTip = require('../models/SleepTip');
const MusicTrack = require('../models/MusicTrack');
const Notification = require('../models/Notification');
const EmergencyContact = require('../models/EmergencyContact');
const HealthTip = require('../models/HealthTip');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /api/v1/admin/stats ───────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            activeUsers,
            nutritionCount,
            fetalCount,
            exerciseCount,
            sleepCount,
            musicCount,
            notificationCount,
            emergencyCount,
            healthTipCount,
            newUsersThisMonth,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            NutritionGuide.countDocuments({ isPublished: true }),
            FetalDevelopment.countDocuments(),
            Exercise.countDocuments({ isPublished: true }),
            SleepTip.countDocuments({ isPublished: true }),
            MusicTrack.countDocuments({ isActive: true }),
            Notification.countDocuments({ status: 'sent' }),
            EmergencyContact.countDocuments({ isActive: true }),
            HealthTip.countDocuments({ isPublished: true }),
            User.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            }),
        ]);

        // Language distribution
        const languageDist = await User.aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } },
        ]);

        // Trimester distribution
        const trimesterDist = await User.aggregate([
            { $match: { currentWeek: { $exists: true } } },
            {
                $addFields: {
                    trimester: {
                        $switch: {
                            branches: [
                                { case: { $lte: ['$currentWeek', 13] }, then: 1 },
                                { case: { $lte: ['$currentWeek', 26] }, then: 2 },
                            ],
                            default: 3,
                        },
                    },
                },
            },
            { $group: { _id: '$trimester', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        return sendSuccess(res, 200, 'Dashboard statistics', {
            users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth },
            content: {
                nutritionGuides: nutritionCount,
                fetalWeeks: fetalCount,
                exercises: exerciseCount,
                sleepTips: sleepCount,
                musicTracks: musicCount,
                healthTips: healthTipCount,
                notifications: notificationCount,
                emergencyContacts: emergencyCount,
            },
            distributions: {
                language: languageDist,
                trimester: trimesterDist,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/v1/admin/users ───────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 20,
            language, isActive, search,
        } = req.query;

        const filter = {};
        if (language !== undefined) filter.language = language;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, users, page, limit, total, 'Users retrieved');
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/v1/admin/users/:id/deactivate ────────────────────────────────────
exports.deactivateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!user) return sendError(res, 404, 'User not found.');

        return sendSuccess(res, 200, 'User deactivated', { userId: user._id, isActive: user.isActive });
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/v1/admin/users/:id/activate ──────────────────────────────────────
exports.activateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );
        if (!user) return sendError(res, 404, 'User not found.');

        return sendSuccess(res, 200, 'User activated', { userId: user._id, isActive: user.isActive });
    } catch (err) {
        next(err);
    }
};
