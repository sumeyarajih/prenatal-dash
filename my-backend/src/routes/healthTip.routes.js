const express = require('express');
const router = express.Router();

const healthTipController = require('../controllers/healthTip.controller');
const { validate, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');

router.get('/', paginationRules, validate, healthTipController.getAll);
router.get('/:id', healthTipController.getOne);

router.post('/', adminAuth, healthTipController.create);
router.put('/:id', adminAuth, healthTipController.update);
router.delete('/:id', adminAuth, healthTipController.remove);

module.exports = router;
