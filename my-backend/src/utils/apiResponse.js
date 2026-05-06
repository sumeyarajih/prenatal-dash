/**
 * Unified API Response Helpers
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}, meta = null) => {
    const response = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
};

/**
 * Extract bilingual content based on lang query param
 * @param {Object} doc - Mongoose document
 * @param {string} lang - 'am' | 'or'
 * @param {string[]} bilingualFields - field names that are bilingual objects
 */
const localize = (doc, lang = 'am', bilingualFields = []) => {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    bilingualFields.forEach((field) => {
        if (obj[field] && typeof obj[field] === 'object') {
            obj[field] = obj[field][lang] || obj[field]['am'] || '';
        }
    });
    return obj;
};

module.exports = { sendSuccess, sendError, sendPaginated, localize };
