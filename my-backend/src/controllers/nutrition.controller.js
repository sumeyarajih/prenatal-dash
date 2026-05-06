const NutritionGuide = require('../models/NutritionGuide');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /api/v1/nutrition ─────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
    try {
        const { trimester, lang = 'am', page = 1, limit = 20 } = req.query;
        const filter = { isPublished: true };
        if (trimester) filter.trimester = Number(trimester);

        const skip = (Number(page) - 1) * Number(limit);
        const total = await NutritionGuide.countDocuments(filter);
        const guides = await NutritionGuide.find(filter)
            .sort({ trimester: 1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const localized = guides.map((g) => localizeGuide(g, lang));

        return sendPaginated(res, localized, page, limit, total);
    } catch (err) {
        next(err);
    }
};

// ── GET /api/v1/nutrition/:id ─────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
    try {
        const { lang = 'am' } = req.query;
        const guide = await NutritionGuide.findById(req.params.id);
        if (!guide) return sendError(res, 404, 'Nutrition guide not found.');

        return sendSuccess(res, 200, 'Guide retrieved', localizeGuide(guide, lang));
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/nutrition (admin) ────────────────────────────────────────────
exports.create = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;

        const guide = await NutritionGuide.create(body);
        return sendSuccess(res, 201, 'Nutrition guide created', guide);
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/v1/nutrition/:id (admin) ─────────────────────────────────────────
exports.update = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;

        const guide = await NutritionGuide.findByIdAndUpdate(
            req.params.id,
            body,
            { new: true, runValidators: true }
        );
        if (!guide) return sendError(res, 404, 'Nutrition guide not found.');

        return sendSuccess(res, 200, 'Nutrition guide updated', guide);
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/v1/nutrition/:id (admin) ──────────────────────────────────────
exports.remove = async (req, res, next) => {
    try {
        const guide = await NutritionGuide.findByIdAndDelete(req.params.id);
        if (!guide) return sendError(res, 404, 'Nutrition guide not found.');

        return sendSuccess(res, 200, 'Nutrition guide deleted');
    } catch (err) {
        next(err);
    }
};

// ── Helper: localize bilingual fields ────────────────────────────────────────
const localizeGuide = (guide, lang) => {
    const obj = guide.toObject ? guide.toObject() : guide;
    const l = lang === 'or' ? 'or' : 'am';

    return {
        ...obj,
        title: obj.title?.[l] || obj.title?.am || '',
        body: obj.body?.[l] || obj.body?.am || '',
        foods: (obj.foods || []).map((f) => ({
            name: f.name?.[l] || f.name?.am || '',
            benefit: f.benefit?.[l] || f.benefit?.am || '',
        })),
    };
};
