const express = require('express');
const router = express.Router();

const musicController = require('../controllers/music.controller');
const { validate, musicRules, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');
const { uploadFields } = require('../middlewares/upload');

router.get('/', paginationRules, validate, musicController.getAll);
router.get('/:id', musicController.getOne);

router.post('/', adminAuth, uploadFields, musicRules, validate, musicController.create);
router.put('/:id', adminAuth, uploadFields, musicController.update);
router.delete('/:id', adminAuth, musicController.remove);

module.exports = router;
