const express = require('express');
const router = express.Router();

const nutritionController = require('../controllers/nutrition.controller');
const { validate, nutritionRules, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');
const { uploadImage } = require('../middlewares/upload');

// Public User routes
router.get('/', paginationRules, validate, nutritionController.getAll);
router.get('/:id', nutritionController.getOne);

// Admin only routes
router.post('/', adminAuth, uploadImage, nutritionRules, validate, nutritionController.create);
router.put('/:id', adminAuth, uploadImage, nutritionController.update);
router.delete('/:id', adminAuth, nutritionController.remove);

module.exports = router;
