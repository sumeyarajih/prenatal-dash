const SleepTip = require('../models/SleepTip');
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
        const { trimester, lang = 'am', page = 1, limit = 20 } = req.query;
        const filter = { isPublished: true };
        if (trimester) filter.$or = [{ trimester: Number(trimester) }, { trimester: 0 }];

        const skip = (Number(page) - 1) * Number(limit);
        const total = await SleepTip.countDocuments(filter);
        const items = await SleepTip.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, items.map((i) => localize(i, lang)), page, limit, total);
    } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
    try {
        const { lang = 'am' } = req.query;
        const item = await SleepTip.findById(req.params.id);
        if (!item) return sendError(res, 404, 'Sleep tip not found.');
        return sendSuccess(res, 200, 'Sleep tip retrieved', localize(item, lang));
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;
        const item = await SleepTip.create(body);
        return sendSuccess(res, 201, 'Sleep tip created', item);
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.file) body.imageUrl = req.file.path;
        const item = await SleepTip.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
        if (!item) return sendError(res, 404, 'Sleep tip not found.');
        return sendSuccess(res, 200, 'Sleep tip updated', item);
    } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
    try {
        const item = await SleepTip.findByIdAndDelete(req.params.id);
        if (!item) return sendError(res, 404, 'Sleep tip not found.');
        return sendSuccess(res, 200, 'Sleep tip deleted');
    } catch (err) { next(err); }
};
