const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const config = {
  // Entorno
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  version: process.env.REACT_APP_VERSION || '1.0.0',

  // Base de datos
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard_bmc',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/dashboard_bmc_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expire: process.env.JWT_EXPIRE || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    issuer: 'dashboard-bmc',
    audience: 'dashboard-bmc-users'
  },

  // Autenticación OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    }
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@dashboardbmc.com'
  },

  // Archivos
  file: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,xlsx,csv').split(','),
    uploadPath: path.join(__dirname, '../uploads')
  },

  // API Keys externas
  apiKeys: {
    alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
    financialModelingPrep: process.env.FINANCIAL_MODELING_PREP_API_KEY,
    yahooFinance: process.env.YAHOO_FINANCE_API_KEY
  },

  // Seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
  },

  // Cliente
  client: {
    url: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development'
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: path.join(__dirname, '../logs/dashboard.log')
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hora
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // Colas
  queue: {
    provider: process.env.QUEUE_PROVIDER || 'redis',
    url: process.env.QUEUE_URL || 'redis://localhost:6379'
  },

  // Notificaciones push
  push: {
    enabled: process.env.PUSH_NOTIFICATIONS_ENABLED === 'true',
    publicKey: process.env.PUSH_PUBLIC_KEY,
    privateKey: process.env.PUSH_PRIVATE_KEY
  },

  // Analytics
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    googleAnalytics: process.env.GOOGLE_ANALYTICS_ID,
    mixpanel: process.env.MIXPANEL_TOKEN
  },

  // Backup
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 2 AM todos los días
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
  },

  // Monitoreo
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    sentry: process.env.SENTRY_DSN,
    newRelic: process.env.NEW_RELIC_LICENSE_KEY
  }
};

module.exports = config;