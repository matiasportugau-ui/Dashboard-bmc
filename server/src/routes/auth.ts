import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  googleAuth,
  facebookAuth,
  googleCallback,
  facebookCallback
} from '../controllers/authController';

const router = express.Router();

// Validación de registro
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 })
];

// Validación de login
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Validación de cambio de contraseña
const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
];

// Validación de recuperación de contraseña
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
];

// Validación de reset de contraseña
const resetPasswordValidation = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
];

// Rutas públicas
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

// OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

// Rutas protegidas
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, validate, changePassword);

// Rutas de administración (solo admin)
router.get('/users', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Lista de usuarios (solo admin)' });
});

export default router;