const HealthTip = require('../models/HealthTip');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

const localize = (doc, lang) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const l = lang === 'or' ? 'or' : 'am';
    return {
        ...obj,
        title: obj.title?.[l] || obj.title?.am || '',
        body: obj.body?.[l] || obj.body?.am || '',
    };
};

exports.getAll = async (req, res, next) => {
    try {
        const { lang = 'am', category, trimester, page = 1, limit = 20 } = req.query;
        const filter = { isPublished: true };
        if (category) filter.category = category;
        if (trimester) filter.$or = [{ trimester: Number(trimester) }, { trimester: 0 }];

        const skip = (Number(page) - 1) * Number(limit);
        const total = await HealthTip.countDocuments(filter);
        const items = await HealthTip.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, items.map((i) => localize(i, lang)), page, limit, total);
    } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
    try {
        const { lang = 'am' } = req.query;
        const item = await HealthTip.findById(req.params.id);
        if (!item) return sendError(res, 404, 'Health tip not found.');
        return sendSuccess(res, 200, 'Health tip retrieved', localize(item, lang));
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const item = await HealthTip.create(req.body);
        return sendSuccess(res, 201, 'Health tip created', item);
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const item = await HealthTip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return sendError(res, 404, 'Health tip not found.');
        return sendSuccess(res, 200, 'Health tip updated', item);
    } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
    try {
        const item = await HealthTip.findByIdAndDelete(req.params.id);
        if (!item) return sendError(res, 404, 'Health tip not found.');
        return sendSuccess(res, 200, 'Health tip deleted');
    } catch (err) { next(err); }
};
