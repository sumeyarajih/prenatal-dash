const express = require('express');
const router = express.Router();

const emergencyController = require('../controllers/emergency.controller');
const { validate, emergencyRules, paginationRules } = require('../utils/validators');
const adminAuth = require('../middlewares/adminAuth');

// Public User routes
router.get('/contacts', paginationRules, validate, emergencyController.getContacts);
router.get('/health-tips', paginationRules, validate, emergencyController.getHealthTips);

// Admin only routes for contacts
router.post('/contacts', adminAuth, emergencyRules, validate, emergencyController.createContact);
router.put('/contacts/:id', adminAuth, emergencyController.updateContact);
router.delete('/contacts/:id', adminAuth, emergencyController.deleteContact);

module.exports = router;
