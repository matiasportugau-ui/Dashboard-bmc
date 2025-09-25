import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialData extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'income' | 'expense' | 'asset' | 'liability' | 'equity';
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  date: Date;
  description?: string;
  tags: string[];
  recurring: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    endDate?: Date;
  };
  metadata: {
    source: string;
    imported: boolean;
    verified: boolean;
    confidence: number;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FinancialDataSchema = new Schema<IFinancialData>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuario es requerido']
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'asset', 'liability', 'equity'],
    required: [true, 'Tipo es requerido']
  },
  category: {
    type: String,
    required: [true, 'Categoría es requerida'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Monto es requerido'],
    min: [0, 'Monto debe ser positivo']
  },
  currency: {
    type: String,
    required: [true, 'Moneda es requerida'],
    default: 'USD',
    uppercase: true,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Fecha es requerida'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descripción no puede exceder 500 caracteres']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: function() {
        return this.recurring?.enabled;
      }
    },
    endDate: {
      type: Date
    }
  },
  metadata: {
    source: {
      type: String,
      default: 'manual',
      enum: ['manual', 'csv', 'api', 'excel', 'bank', 'accounting']
    },
    imported: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    notes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización de consultas
FinancialDataSchema.index({ userId: 1, date: -1 });
FinancialDataSchema.index({ userId: 1, type: 1 });
FinancialDataSchema.index({ userId: 1, category: 1 });
FinancialDataSchema.index({ userId: 1, tags: 1 });
FinancialDataSchema.index({ userId: 1, 'recurring.enabled': 1 });
FinancialDataSchema.index({ date: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 * 5 }); // TTL de 5 años

// Virtual para formateo de moneda
FinancialDataSchema.virtual('formattedAmount').get(function() {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2
  });
  return formatter.format(this.amount);
});

// Virtual para mes/año
FinancialDataSchema.virtual('monthYear').get(function() {
  return this.date.toISOString().substring(0, 7); // YYYY-MM
});

// Middleware para validar datos
FinancialDataSchema.pre('save', function(next) {
  // Normalizar categoría
  this.category = this.category.trim().toLowerCase();
  if (this.subcategory) {
    this.subcategory = this.subcategory.trim().toLowerCase();
  }

  // Normalizar tags
  this.tags = this.tags.map((tag: string) => tag.trim().toLowerCase());

  // Validar fechas de recurrencia
  if (this.recurring.enabled && this.recurring.endDate && this.recurring.endDate <= this.date) {
    this.recurring.enabled = false;
  }

  next();
});

// Método estático para obtener datos por período
FinancialDataSchema.statics.getByPeriod = function(userId: string, startDate: Date, endDate: Date) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });
};

// Método estático para obtener resumen financiero
FinancialDataSchema.statics.getFinancialSummary = function(userId: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

export default mongoose.model<IFinancialData>('FinancialData', FinancialDataSchema);