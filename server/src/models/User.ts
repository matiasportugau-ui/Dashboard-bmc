import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      reports: boolean;
    };
  };
  oauthProviders: {
    google?: {
      id: string;
      email: string;
      verified: boolean;
    };
    facebook?: {
      id: string;
      email: string;
      verified: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Contraseña es requerida'],
    minlength: [8, 'Contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir en consultas por defecto
  },
  firstName: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    maxlength: [50, 'Nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'Apellido es requerido'],
    trim: true,
    maxlength: [50, 'Apellido no puede exceder 50 caracteres']
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'viewer'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  avatar: {
    type: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'es'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reports: { type: Boolean, default: true }
    }
  },
  oauthProviders: {
    google: {
      id: String,
      email: String,
      verified: Boolean
    },
    facebook: {
      id: String,
      email: String,
      verified: Boolean
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'oauthProviders.google.id': 1 });
UserSchema.index({ 'oauthProviders.facebook.id': 1 });

// Virtual para nombre completo
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware para hashear contraseña
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener nombre completo
UserSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Eliminar campos sensibles al convertir a JSON
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.oauthProviders;
  return userObject;
};

export default mongoose.model<IUser>('User', UserSchema);