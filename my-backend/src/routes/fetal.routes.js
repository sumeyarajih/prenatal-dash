const express = require('express');
const router = express.Router();

const fetalController = require('../controllers/fetal.controller');
const { validate, fetalRules, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');
const { uploadImage } = require('../middlewares/upload');

// Public User routes
router.get('/', paginationRules, validate, fetalController.getAll);
router.get('/week/:week', fetalController.getByWeek);

// Admin only routes
router.post('/', adminAuth, uploadImage, fetalRules, validate, fetalController.create);
router.put('/:id', adminAuth, uploadImage, fetalController.update);

module.exports = router;
