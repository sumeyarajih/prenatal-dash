const Exercise = require('../models/Exercise');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

const localize = (doc, lang) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const l = lang === 'or' ? 'or' : 'am';
    return {
        ...obj,
        title: obj.title?.[l] || obj.title?.am || '',
        description: obj.description?.[l] || obj.description?.am || '',
    };
};

exports.getAll = async (req, res, next) => {
    try {
        const { trimester, lang = 'am', category, page = 1, limit = 20 } = req.query;
        const filter = { isPublished: true };
        if (trimester) filter.trimester = Number(trimester);
        if (category) filter.category = category;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Exercise.countDocuments(filter);
        const items = await Exercise.find(filter)
            .sort({ trimester: 1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, items.map((i) => localize(i, lang)), page, limit, total);
    } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
    try {
        const { lang = 'am' } = req.query;
        const item = await Exercise.findById(req.params.id);
        if (!item) return sendError(res, 404, 'Exercise not found.');
        return sendSuccess(res, 200, 'Exercise retrieved', localize(item, lang));
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;
        const item = await Exercise.create(body);
        return sendSuccess(res, 201, 'Exercise created', item);
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;
        const item = await Exercise.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
        if (!item) return sendError(res, 404, 'Exercise not found.');
        return sendSuccess(res, 200, 'Exercise updated', item);
    } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
    try {
        const item = await Exercise.findByIdAndDelete(req.params.id);
        if (!item) return sendError(res, 404, 'Exercise not found.');
        return sendSuccess(res, 200, 'Exercise deleted');
    } catch (err) { next(err); }
};
