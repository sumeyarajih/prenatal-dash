const express = require('express');
const router = express.Router();

const exerciseController = require('../controllers/exercise.controller');
const { validate, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');
const { uploadImage } = require('../middlewares/upload');

// Public routes
router.get('/', paginationRules, validate, exerciseController.getAll);
router.get('/:id', exerciseController.getOne);

// Admin routes
router.post('/', adminAuth, uploadImage, exerciseController.create);
router.put('/:id', adminAuth, uploadImage, exerciseController.update);
router.delete('/:id', adminAuth, exerciseController.remove);

module.exports = router;
