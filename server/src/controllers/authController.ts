import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../../../config';
import { logger } from '../utils/logger';

// Generar tokens JWT
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expire,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    }
  );

  const refreshToken = jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    {
      expiresIn: '30d',
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    }
  );

  return { accessToken, refreshToken };
};

// Registro de usuario
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuario ya existe con este email'
      });
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Error en registro:', error);
    next(error);
  }
};

// Login de usuario
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          preferences: user.preferences
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Error en login:', error);
    next(error);
  }
};

// Logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // En una implementación real, invalidar el token en Redis o BD
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { userId: string };

    // Generar nuevos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Error en refresh token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Obtener perfil
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error obteniendo perfil:', error);
    next(error);
  }
};

// Actualizar perfil
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { firstName, lastName, preferences },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user }
    });
  } catch (error) {
    logger.error('Error actualizando perfil:', error);
    next(error);
  }
};

// Cambiar contraseña
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error cambiando contraseña:', error);
    next(error);
  }
};

// Recuperar contraseña
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }

    // En una implementación real, generar token y enviar email
    logger.info(`Solicitud de recuperación de contraseña para: ${email}`);

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
    });
  } catch (error) {
    logger.error('Error en forgot password:', error);
    next(error);
  }
};

// Reset contraseña
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // En una implementación real, verificar token y resetear contraseña
    res.json({
      success: true,
      message: 'Contraseña reseteada exitosamente'
    });
  } catch (error) {
    logger.error('Error en reset password:', error);
    next(error);
  }
};

// OAuth Google
export const googleAuth = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Google OAuth - Implementar según necesidades'
  });
};

export const googleCallback = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Google OAuth Callback - Implementar según necesidades'
  });
};

// OAuth Facebook
export const facebookAuth = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Facebook OAuth - Implementar según necesidades'
  });
};

export const facebookCallback = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Facebook OAuth Callback - Implementar según necesidades'
  });
};