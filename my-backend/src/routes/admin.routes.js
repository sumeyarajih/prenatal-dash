const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { validate, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');

router.use(adminAuth);

router.get('/stats', adminController.getStats);
router.get('/users', paginationRules, validate, adminController.getUsers);
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/activate', adminController.activateUser);

module.exports = router;
