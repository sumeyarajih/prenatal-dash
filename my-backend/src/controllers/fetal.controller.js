const FetalDevelopment = require('../models/FetalDevelopment');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

const localize = (doc, lang) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const l = lang === 'or' ? 'or' : 'am';
    return {
        ...obj,
        sizeComparison: obj.sizeComparison?.[l] || obj.sizeComparison?.am || '',
        milestones: obj.milestones?.[l] || obj.milestones?.am || '',
        tipsForMother: obj.tipsForMother?.[l] || obj.tipsForMother?.am || '',
    };
};

// ── GET /api/v1/fetal?lang=am ─────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
    try {
        const { lang = 'am', page = 1, limit = 42 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const total = await FetalDevelopment.countDocuments();
        const weeks = await FetalDevelopment.find()
            .sort({ week: 1 })
            .skip(skip)
            .limit(Number(limit));

        const localized = weeks.map((w) => localize(w, lang));
        return sendPaginated(res, localized, page, limit, total);
    } catch (err) {
        next(err);
    }
};

// ── GET /api/v1/fetal/week/:week?lang=am ─────────────────────────────────────
exports.getByWeek = async (req, res, next) => {
    try {
        const { lang = 'am' } = req.query;
        const week = Number(req.params.week);

        if (isNaN(week) || week < 1 || week > 42) {
            return sendError(res, 400, 'Week must be between 1 and 42.');
        }

        const fetalData = await FetalDevelopment.findOne({ week });
        if (!fetalData) return sendError(res, 404, `No data found for week ${week}.`);

        return sendSuccess(res, 200, `Week ${week} fetal data`, localize(fetalData, lang));
    } catch (err) {
        next(err);
    }
};

// ── POST /api/v1/fetal (admin) ────────────────────────────────────────────────
exports.create = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;

        const fetal = await FetalDevelopment.create(body);
        return sendSuccess(res, 201, 'Fetal week data created', fetal);
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/v1/fetal/:id (admin) ─────────────────────────────────────────────
exports.update = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;

        const fetal = await FetalDevelopment.findByIdAndUpdate(
            req.params.id,
            body,
            { new: true, runValidators: true }
        );
        if (!fetal) return sendError(res, 404, 'Fetal data not found.');

        return sendSuccess(res, 200, 'Fetal data updated', fetal);
    } catch (err) {
        next(err);
    }
};
