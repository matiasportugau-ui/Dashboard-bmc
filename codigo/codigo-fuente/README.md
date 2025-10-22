# Código Fuente - Dashboard BMC

## 📁 Estructura del Código

```
codigo-fuente/
├── README.md                    # Este archivo
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes React reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios y APIs
│   │   ├── store/             # Estado global (Redux)
│   │   ├── utils/             # Utilidades y helpers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # Definiciones TypeScript
│   │   └── styles/            # Estilos globales
│   ├── public/                # Assets públicos
│   ├── package.json           # Dependencias frontend
│   ├── vite.config.ts         # Configuración Vite
│   ├── tailwind.config.js     # Configuración Tailwind
│   └── tsconfig.json          # Configuración TypeScript
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── models/            # Modelos de datos
│   │   ├── middleware/        # Middleware personalizado
│   │   ├── routes/            # Definición de rutas
│   │   ├── utils/             # Utilidades backend
│   │   ├── config/            # Configuraciones
│   │   └── types/             # Tipos TypeScript
│   ├── prisma/                # Schema y migraciones
│   ├── package.json           # Dependencias backend
│   ├── tsconfig.json          # Configuración TypeScript
│   └── jest.config.js         # Configuración testing
├── database/                   # Scripts de base de datos
│   ├── migrations/            # Migraciones SQL
│   ├── seeds/                 # Datos de prueba
│   └── schemas/               # Esquemas de BD
├── tests/                      # Pruebas automatizadas
│   ├── unit/                  # Pruebas unitarias
│   ├── integration/           # Pruebas de integración
│   └── e2e/                   # Pruebas end-to-end
└── docker/                     # Configuraciones Docker
    ├── Dockerfile.frontend
    ├── Dockerfile.backend
    └── docker-compose.yml
```

## 🚀 Stack Tecnológico

### Frontend
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0+",
  "build": "Vite 4.4.0",
  "styling": "Tailwind CSS 3.3.0",
  "state": "Redux Toolkit 1.9.0",
  "router": "React Router 6.0.0",
  "charts": "Chart.js 4.0.0",
  "forms": "React Hook Form 7.0.0",
  "ui": "Headless UI 1.7.0",
  "icons": "Heroicons 2.0.0",
  "testing": "Jest + React Testing Library"
}
```

### Backend
```json
{
  "runtime": "Node.js 18.17.0",
  "framework": "Express.js 4.18.0",
  "language": "TypeScript 5.0+",
  "database": "PostgreSQL 15+",
  "orm": "Prisma 5.0.0",
  "cache": "Redis 7.0+",
  "auth": "jsonwebtoken 9.0.0",
  "validation": "Joi 17.0.0",
  "testing": "Jest + Supertest",
  "documentation": "Swagger/OpenAPI 3.0"
}
```

## 📦 Comandos de Desarrollo

### Setup Inicial
```bash
# Clonar e instalar dependencias
git clone <repository-url>
cd dashboard-bmc

# Backend setup
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push

# Frontend setup  
cd ../frontend
npm install

# Docker setup (alternativo)
docker-compose up -d
```

### Desarrollo
```bash
# Backend development
cd backend
npm run dev          # Inicia servidor en modo desarrollo
npm run test         # Ejecuta pruebas
npm run test:watch   # Pruebas en modo watch
npm run lint         # Linting del código

# Frontend development
cd frontend  
npm run dev          # Inicia app en modo desarrollo
npm run build        # Build para producción
npm run test         # Ejecuta pruebas
npm run storybook    # Inicia Storybook
```

### Testing
```bash
# Pruebas completas
npm run test:all     # Todas las pruebas
npm run test:unit    # Solo unitarias
npm run test:int     # Solo integración
npm run test:e2e     # Solo end-to-end
npm run test:coverage # Con coverage report
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dashboard_bmc"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"

# API Keys
ALPHA_VANTAGE_KEY="your-api-key"
SENDGRID_API_KEY="your-sendgrid-key"

# Environment
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Monitoring
NEW_RELIC_LICENSE_KEY="your-license-key"
SENTRY_DSN="your-sentry-dsn"
```

#### Frontend (.env)
```bash
# API
VITE_API_URL="http://localhost:3001/api/v1"
VITE_WS_URL="ws://localhost:3001"

# Environment
VITE_NODE_ENV="development"

# External Services
VITE_GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": ["frontend", "backend"],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

## 🏗️ Arquitectura del Código

### Frontend Architecture
```typescript
// src/types/index.ts - Tipos principales
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
}

export interface KPI {
  id: string;
  code: string;
  name: string;
  value: number;
  unit?: string;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

// src/store/index.ts - Redux store
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// src/services/api.ts - API service
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Backend Architecture
```typescript
// src/types/index.ts - Tipos principales
export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface KPICalculationRequest {
  kpiIds: string[];
  period: {
    from: Date;
    to: Date;
  };
  forceRecalculation?: boolean;
}

// src/config/database.ts - Configuración DB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  errorFormat: 'pretty',
});

export default prisma;

// src/middleware/auth.ts - Middleware autenticación
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user as UserPayload;
    next();
  });
};

// src/controllers/dashboardController.ts - Controlador principal
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  private dashboardService = new DashboardService();

  getSummary = async (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query;
      const summary = await this.dashboardService.getDashboardSummary(
        req.user!.id,
        period as string
      );
      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch dashboard summary' 
      });
    }
  };
}
```

## 🧪 Testing Strategy

### Unit Tests Example
```typescript
// frontend/src/components/__tests__/KPIWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { KPIWidget } from '../KPIWidget';
import type { KPI } from '../../types';

const mockKPI: KPI = {
  id: 'roi',
  code: 'ROI',
  name: 'Return on Investment',
  value: 15.4,
  unit: '%',
  target: 15.0,
  status: 'good',
  trend: { direction: 'up', percentage: 2.3 }
};

describe('KPIWidget', () => {
  it('renders KPI data correctly', () => {
    render(<KPIWidget kpi={mockKPI} />);
    
    expect(screen.getByText('Return on Investment')).toBeInTheDocument();
    expect(screen.getByText('15.4%')).toBeInTheDocument();
    expect(screen.getByText('↗️ +2.3%')).toBeInTheDocument();
  });

  it('shows correct status styling', () => {
    render(<KPIWidget kpi={mockKPI} />);
    
    const widget = screen.getByTestId('kpi-widget');
    expect(widget).toHaveClass('border-green-500');
  });
});

// backend/src/services/__tests__/kpiService.test.ts
import { KPIService } from '../kpiService';
import prisma from '../../config/database';

jest.mock('../../config/database');

describe('KPIService', () => {
  let kpiService: KPIService;

  beforeEach(() => {
    kpiService = new KPIService();
  });

  describe('calculateROI', () => {
    it('calculates ROI correctly', async () => {
      // Mock data
      const mockFinancialData = [
        { type: 'revenue', amount: 1000000 },
        { type: 'expense', amount: 800000 }
      ];

      (prisma.financialData.findMany as jest.Mock).mockResolvedValue(mockFinancialData);

      const roi = await kpiService.calculateROI('2025-09-01', '2025-09-30');
      
      expect(roi).toBe(25); // (1000000 - 800000) / 800000 * 100
    });
  });
});
```

### API Integration Tests
```typescript
// backend/src/__tests__/api/dashboard.test.ts
import request from 'supertest';
import app from '../../app';
import { generateTestToken } from '../helpers/auth';

describe('Dashboard API', () => {
  const authToken = generateTestToken({ 
    id: 'user1', 
    role: 'analyst' 
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('returns dashboard summary for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('kpis');
      expect(response.body.data).toHaveProperty('alerts');
      expect(response.body.data).toHaveProperty('quickStats');
    });

    it('returns 401 without auth token', async () => {
      await request(app)
        .get('/api/v1/dashboard/summary')
        .expect(401);
    });
  });
});
```

## 📱 Componentes Frontend Clave

### KPI Widget Component
```typescript
// src/components/KPIWidget.tsx
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import type { KPI } from '../types';

interface KPIWidgetProps {
  kpi: KPI;
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({ kpi, className = '' }) => {
  const getStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'good': return 'border-green-500 bg-green-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'critical': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
      default: return <span className="w-4 h-4 text-gray-400">—</span>;
    }
  };

  return (
    <div 
      className={`
        p-6 rounded-lg border-2 ${getStatusColor(kpi.status)} 
        hover:shadow-lg transition-shadow ${className}
      `}
      data-testid="kpi-widget"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
        <div className="flex items-center space-x-1">
          {getTrendIcon(kpi.trend.direction)}
          <span className={`text-sm ${
            kpi.trend.direction === 'up' ? 'text-green-600' : 
            kpi.trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {kpi.trend.percentage > 0 ? '+' : ''}{kpi.trend.percentage}%
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {kpi.value.toLocaleString()}
          {kpi.unit && <span className="text-lg text-gray-600">{kpi.unit}</span>}
        </span>
      </div>
      
      {kpi.target && (
        <div className="text-xs text-gray-500">
          Target: {kpi.target.toLocaleString()}{kpi.unit}
        </div>
      )}
    </div>
  );
};
```

### Dashboard Page
```typescript
// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboardSummary } from '../store/slices/dashboardSlice';
import { KPIWidget } from '../components/KPIWidget';
import { ChartWidget } from '../components/ChartWidget';
import { AlertsPanel } from '../components/AlertsPanel';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summary, loading, error } = useAppSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummary({ period: '30d' }));
  }, [dispatch]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-8">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Alerts */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <AlertsPanel alerts={summary.alerts} />
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summary?.kpis.map(kpi => (
          <KPIWidget key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Revenue Trend" 
          chartId="revenue_trend"
          type="line"
        />
        <ChartWidget 
          title="Expenses Breakdown" 
          chartId="expenses_breakdown"
          type="pie"
        />
      </div>
    </div>
  );
};
```

## 🔄 Estado Actual del Código

### ✅ Estructuras Preparadas
- [x] **Arquitectura de carpetas** definida
- [x] **Stack tecnológico** especificado
- [x] **Configuraciones** de desarrollo
- [x] **Ejemplos de componentes** principales
- [x] **Testing strategy** con ejemplos
- [x] **Scripts de desarrollo** documentados

### 🔄 Pendiente de Implementación
- [ ] **Código completo** de todos los componentes
- [ ] **APIs backend** completamente implementadas
- [ ] **Base de datos** con migraciones
- [ ] **Pruebas automatizadas** completas
- [ ] **Docker setup** para desarrollo
- [ ] **CI/CD pipeline** configurado

### 📝 Próximos Pasos para GPT

1. **Implementar autenticación** con JWT y MFA
2. **Desarrollar componentes** de dashboard principales
3. **Crear APIs** para KPIs y reportes
4. **Setup de base de datos** con Prisma
5. **Configurar testing** automatizado
6. **Setup de CI/CD** con GitHub Actions

---

*Estructura de código fuente lista para desarrollo completo - Dashboard BMC*