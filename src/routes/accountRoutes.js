import express from 'express';
import accountController from '../controllers/acountController.js';

const router = express.Router();

// GET /api/account/:id/settings - Get account settings
router.get('/:id/settings', accountController.getAccountSettings);

// PUT /api/account/:id/settings - Update account settings
router.put('/:id/settings', accountController.updateAccountSettings);

// PUT /api/account/:id/profile - Update profile information
router.put('/:id/profile', accountController.updateProfile);

// PUT /api/account/:id/contact - Update contact information
router.put('/:id/contact', accountController.updateContact);

export default router;