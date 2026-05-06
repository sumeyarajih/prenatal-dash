const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validate, registerRules, loginRules, adminLoginRules } = require('../utils/validators');
const auth = require('../middlewares/auth');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/admin/login', adminLoginRules, validate, authController.adminLogin);

// Internal route for bootstrapping an admin (ideally protected or removed in prod)
router.post('/admin/register', authController.adminRegister);

// Update FCM token
router.put('/fcm-token', auth, authController.updateFcmToken);

module.exports = router;
