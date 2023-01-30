import express from 'express';
import * as authController from '../../controllers/auth/authController.js';
import * as authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup/admin', authController.signupAdmin);
router.post('/signup/user', authController.signupUser);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/change-password',
  authMiddleware.protect,
  authController.changePassword
);
router.get('/me', authMiddleware.protect, authController.getMe);
router.patch('/update-me', authMiddleware.protect, authController.updateMe);

export default router;
