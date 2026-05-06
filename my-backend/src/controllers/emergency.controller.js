const EmergencyContact = require('../models/EmergencyContact');
const HealthTip = require('../models/HealthTip');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /api/v1/emergency/contacts?city=Addis ────────────────────────────────
exports.getContacts = async (req, res, next) => {
    try {
        const { city, region, page = 1, limit = 20 } = req.query;
        const filter = { isActive: true };
        if (city) filter.city = new RegExp(city, 'i');
        if (region) filter.region = new RegExp(region, 'i');

        const skip = (Number(page) - 1) * Number(limit);
        const total = await EmergencyContact.countDocuments(filter);
        const items = await EmergencyContact.find(filter)
            .sort({ hospitalName: 1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, items, page, limit, total);
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/emergency/contacts (admin) ───────────────────────────────────
exports.createContact = async (req, res, next) => {
    try {
        const item = await EmergencyContact.create(req.body);
        return sendSuccess(res, 201, 'Emergency contact created', item);
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/v1/emergency/contacts/:id (admin) ────────────────────────────────
exports.updateContact = async (req, res, next) => {
    try {
        const item = await EmergencyContact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) return sendError(res, 404, 'Emergency contact not found.');
        return sendSuccess(res, 200, 'Emergency contact updated', item);
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/v1/emergency/contacts/:id (admin) ────────────────────────────
exports.deleteContact = async (req, res, next) => {
    try {
        const item = await EmergencyContact.findByIdAndDelete(req.params.id);
        if (!item) return sendError(res, 404, 'Emergency contact not found.');
        return sendSuccess(res, 200, 'Emergency contact deleted');
    } catch (err) {
        next(err);
    }
};

// ── GET /api/v1/emergency/health-tips?lang=am ────────────────────────────────
exports.getHealthTips = async (req, res, next) => {
    try {
        const { lang = 'am', category, trimester, page = 1, limit = 20 } = req.query;
        const l = lang === 'or' ? 'or' : 'am';

        const filter = { isPublished: true };
        if (category) filter.category = category;
        if (trimester) filter.$or = [{ trimester: Number(trimester) }, { trimester: 0 }];

        const skip = (Number(page) - 1) * Number(limit);
        const total = await HealthTip.countDocuments(filter);
        const items = await HealthTip.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const localized = items.map((item) => {
            const obj = item.toObject();
            return {
                ...obj,
                title: obj.title?.[l] || obj.title?.am || '',
                body: obj.body?.[l] || obj.body?.am || '',
            };
        });

        return sendPaginated(res, localized, page, limit, total);
    } catch (err) {
        next(err);
    }
};
