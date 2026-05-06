const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { validate, notificationRules, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');

router.use(adminAuth);

router.post('/send', notificationRules, validate, notificationController.sendNow);
router.post('/schedule', notificationRules, validate, notificationController.schedule);
router.get('/history', paginationRules, validate, notificationController.getHistory);

module.exports = router;
