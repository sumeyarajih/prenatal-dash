const MusicTrack = require('../models/MusicTrack');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

const localize = (doc, lang) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const l = lang === 'or' ? 'or' : 'am';
    return { ...obj, title: obj.title?.[l] || obj.title?.am || '' };
};

exports.getAll = async (req, res, next) => {
    try {
        const { category, lang = 'am', page = 1, limit = 20 } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await MusicTrack.countDocuments(filter);
        const items = await MusicTrack.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return sendPaginated(res, items.map((i) => localize(i, lang)), page, limit, total);
    } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
    try {
        const { lang = 'am' } = req.query;
        const item = await MusicTrack.findById(req.params.id);
        if (!item) return sendError(res, 404, 'Music track not found.');
        return sendSuccess(res, 200, 'Music track retrieved', localize(item, lang));
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.files?.audio) body.audioUrl = req.files.audio[0].path;
        if (req.files?.thumbnail) body.thumbnailUrl = req.files.thumbnail[0].path;
        // multer single audio fallback
        if (req.file) body.audioUrl = req.file.path;

        const item = await MusicTrack.create(body);
        return sendSuccess(res, 201, 'Music track created', item);
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const body = { ...req.body };
        if (req.files?.audio) body.audioUrl = req.files.audio[0].path;
        if (req.files?.thumbnail) body.thumbnailUrl = req.files.thumbnail[0].path;
        if (req.file) body.audioUrl = req.file.path;

        const item = await MusicTrack.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
        if (!item) return sendError(res, 404, 'Music track not found.');
        return sendSuccess(res, 200, 'Music track updated', item);
    } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
    try {
        const item = await MusicTrack.findByIdAndDelete(req.params.id);
        if (!item) return sendError(res, 404, 'Music track not found.');
        return sendSuccess(res, 200, 'Music track deleted');
    } catch (err) { next(err); }
};
