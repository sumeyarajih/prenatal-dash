const express = require('express');
const router = express.Router();

const sleepController = require('../controllers/sleep.controller');
const { validate, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');
const { uploadImage } = require('../middlewares/upload');

router.get('/', paginationRules, validate, sleepController.getAll);
router.get('/:id', sleepController.getOne);

router.post('/', adminAuth, uploadImage, sleepController.create);
router.put('/:id', adminAuth, uploadImage, sleepController.update);
router.delete('/:id', adminAuth, sleepController.remove);

module.exports = router;
