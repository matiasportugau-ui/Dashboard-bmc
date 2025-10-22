# APIs Documentation - Dashboard BMC

## 🔌 API Overview

### API Base Information
```
Base URL: https://api.dashboard-bmc.com/v1
Authentication: Bearer JWT Token
Content-Type: application/json
Rate Limiting: 100 requests/minute per user
API Version: v1.0.0
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-09-25T10:30:00Z",
    "version": "v1.0.0",
    "requestId": "req_123456789"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-09-25T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🔐 Authentication API

### POST /auth/login
Authenticate user and obtain access tokens.

**Request:**
```javascript
{
  "email": "user@example.com",
  "password": "securePassword123",
  "rememberMe": false,
  "mfaCode": "123456" // Required if MFA enabled
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "def50200d8f...",
    "expiresIn": 900, // 15 minutes
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "analyst",
      "permissions": ["read:dashboard", "create:reports"],
      "lastLogin": "2025-09-25T10:30:00Z"
    }
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```javascript
{
  "refreshToken": "def50200d8f..."
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### POST /auth/logout
Invalidate current session.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com", 
    "firstName": "John",
    "lastName": "Doe",
    "role": "analyst",
    "permissions": ["read:dashboard", "create:reports"],
    "preferences": {
      "theme": "light",
      "timezone": "America/New_York",
      "dashboardLayout": "compact"
    },
    "lastLogin": "2025-09-25T10:30:00Z",
    "createdAt": "2025-01-15T08:00:00Z"
  }
}
```

## 📊 Dashboard API

### GET /dashboard/summary
Get dashboard summary with key metrics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `period` (optional): `7d`, `30d`, `90d`, `1y` (default: `30d`)
- `timezone` (optional): User timezone (default: UTC)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "period": "30d",
    "kpis": [
      {
        "id": "roi",
        "name": "Return on Investment",
        "value": 15.4,
        "unit": "%",
        "target": 15.0,
        "status": "good", // "good", "warning", "critical"
        "trend": {
          "direction": "up", // "up", "down", "stable"
          "percentage": 2.3,
          "comparedTo": "previous_period"
        },
        "lastUpdated": "2025-09-25T10:00:00Z"
      },
      {
        "id": "revenue_growth",
        "name": "Revenue Growth",
        "value": 12.8,
        "unit": "%",
        "target": 10.0,
        "status": "good",
        "trend": {
          "direction": "up",
          "percentage": 1.5,
          "comparedTo": "previous_period"
        },
        "lastUpdated": "2025-09-25T10:00:00Z"
      }
    ],
    "alerts": [
      {
        "id": "alert_001",
        "type": "warning",
        "message": "Cash flow is approaching warning threshold",
        "kpiId": "cash_flow",
        "threshold": 85.0,
        "currentValue": 87.2,
        "createdAt": "2025-09-25T09:45:00Z"
      }
    ],
    "quickStats": {
      "totalRevenue": 2500000,
      "totalExpenses": 1800000,
      "netProfit": 700000,
      "currency": "USD"
    }
  }
}
```

### GET /dashboard/kpis
Get all KPIs with current values and historical data.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `kpiIds` (optional): Comma-separated KPI IDs to filter
- `period` (optional): `7d`, `30d`, `90d`, `1y` (default: `30d`)
- `includeHistory` (optional): `true`/`false` (default: `false`)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "kpis": [
      {
        "id": "roi",
        "name": "Return on Investment",
        "description": "Measures the efficiency of investment",
        "formula": "(Profit - Investment) / Investment * 100",
        "category": "profitability",
        "currentValue": 15.4,
        "unit": "%",
        "target": 15.0,
        "thresholds": {
          "warning": 10.0,
          "critical": 5.0
        },
        "status": "good",
        "trend": {
          "direction": "up",
          "percentage": 2.3,
          "comparedTo": "previous_period"
        },
        "history": [
          {
            "date": "2025-09-25",
            "value": 15.4
          },
          {
            "date": "2025-09-24", 
            "value": 15.1
          }
        ],
        "lastCalculated": "2025-09-25T10:00:00Z"
      }
    ]
  }
}
```

### POST /dashboard/kpis/calculate
Trigger KPI recalculation for specific KPIs.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```javascript
{
  "kpiIds": ["roi", "revenue_growth"],
  "forceRecalculation": true,
  "period": {
    "from": "2025-09-01",
    "to": "2025-09-25"
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "jobId": "calc_job_123",
    "status": "started",
    "estimatedCompletion": "2025-09-25T10:35:00Z",
    "kpisToCalculate": ["roi", "revenue_growth"]
  }
}
```

### GET /dashboard/charts/{chartId}
Get chart data for visualization.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `chartId`: Chart identifier

**Query Parameters:**
- `period` (optional): `7d`, `30d`, `90d`, `1y` (default: `30d`)
- `granularity` (optional): `hour`, `day`, `week`, `month` (default: `day`)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "chartId": "revenue_trend",
    "title": "Revenue Trend",
    "type": "line",
    "period": "30d",
    "granularity": "day",
    "datasets": [
      {
        "label": "Revenue",
        "data": [
          {
            "x": "2025-09-01",
            "y": 85000
          },
          {
            "x": "2025-09-02",
            "y": 92000
          }
        ],
        "borderColor": "#2563EB",
        "backgroundColor": "#2563EB20"
      }
    ],
    "options": {
      "responsive": true,
      "scales": {
        "y": {
          "beginAtZero": false,
          "format": "currency"
        }
      }
    },
    "lastUpdated": "2025-09-25T10:00:00Z"
  }
}
```

## 📑 Reports API

### GET /reports
Get list of available reports.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): `generated`, `template`, `scheduled`
- `status` (optional): `pending`, `completed`, `failed`

**Response:**
```javascript
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_123",
        "name": "Monthly Financial Summary",
        "type": "generated",
        "status": "completed",
        "format": "pdf",
        "size": 2048576, // bytes
        "createdBy": {
          "id": "user_123",
          "name": "John Doe"
        },
        "createdAt": "2025-09-25T09:00:00Z",
        "downloadUrl": "https://cdn.dashboard-bmc.com/reports/report_123.pdf",
        "expiresAt": "2025-10-25T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### POST /reports/generate
Generate a new report.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```javascript
{
  "templateId": "monthly_summary",
  "name": "September 2025 Financial Report",
  "format": "pdf", // "pdf", "excel", "csv"
  "parameters": {
    "period": {
      "from": "2025-09-01",
      "to": "2025-09-30"
    },
    "includeCharts": true,
    "includeComparisons": true,
    "kpis": ["roi", "revenue_growth", "profit_margin"]
  },
  "delivery": {
    "email": "user@example.com",
    "schedule": null // or cron expression for scheduled reports
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "reportId": "report_456",
    "status": "pending",
    "estimatedCompletion": "2025-09-25T10:35:00Z",
    "jobId": "gen_job_789"
  }
}
```

### GET /reports/{reportId}
Get specific report details and download link.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Path Parameters:**
- `reportId`: Report identifier

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "report_123",
    "name": "Monthly Financial Summary",
    "description": "Comprehensive financial overview for September 2025",
    "type": "generated",
    "status": "completed",
    "format": "pdf",
    "size": 2048576,
    "pages": 15,
    "parameters": {
      "period": {
        "from": "2025-09-01",
        "to": "2025-09-30"
      },
      "kpis": ["roi", "revenue_growth", "profit_margin"]
    },
    "createdBy": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "createdAt": "2025-09-25T09:00:00Z",
    "completedAt": "2025-09-25T09:15:00Z",
    "downloadUrl": "https://cdn.dashboard-bmc.com/reports/report_123.pdf",
    "previewUrl": "https://cdn.dashboard-bmc.com/reports/report_123_preview.png",
    "expiresAt": "2025-10-25T09:00:00Z"
  }
}
```

### DELETE /reports/{reportId}
Delete a report.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "message": "Report deleted successfully"
  }
}
```

## 👥 Users API (Admin Only)

### GET /admin/users
Get list of users (admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Required Permission:** `admin:read_users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role
- `status` (optional): `active`, `inactive`

**Response:**
```javascript
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "analyst",
        "isActive": true,
        "lastLogin": "2025-09-25T10:30:00Z",
        "createdAt": "2025-01-15T08:00:00Z",
        "dashboardCount": 3,
        "reportCount": 12
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

### POST /admin/users
Create a new user (admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Required Permission:** `admin:create_users`

**Request:**
```javascript
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "viewer",
  "password": "temporaryPassword123",
  "sendWelcomeEmail": true
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "user_456",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "viewer",
    "isActive": true,
    "createdAt": "2025-09-25T10:30:00Z",
    "welcomeEmailSent": true
  }
}
```

### PUT /admin/users/{userId}
Update user information (admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Required Permission:** `admin:update_users`

**Request:**
```javascript
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "analyst",
  "isActive": true
}
```

## 📊 Analytics API

### GET /analytics/trends
Get trend analysis for specific metrics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `metrics`: Comma-separated metric names
- `period`: `7d`, `30d`, `90d`, `1y`
- `granularity`: `hour`, `day`, `week`, `month`

**Response:**
```javascript
{
  "success": true,
  "data": {
    "trends": [
      {
        "metric": "revenue",
        "period": "30d",
        "granularity": "day",
        "trend": {
          "direction": "up",
          "strength": "strong", // "weak", "moderate", "strong"
          "percentage": 12.5,
          "r_squared": 0.85
        },
        "forecast": [
          {
            "date": "2025-09-26",
            "predicted": 95000,
            "confidence": 0.85
          }
        ],
        "anomalies": [
          {
            "date": "2025-09-20",
            "value": 125000,
            "expected": 95000,
            "severity": "medium"
          }
        ]
      }
    ]
  }
}
```

## 🔔 Notifications API

### GET /notifications
Get user notifications.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `unreadOnly` (optional): `true`/`false` (default: `false`)
- `type` (optional): `alert`, `report`, `system`
- `limit` (optional): Items to return (default: 50)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "alert",
        "title": "KPI Alert: Cash Flow Warning",
        "message": "Cash flow has dropped below the warning threshold",
        "severity": "warning",
        "isRead": false,
        "actionUrl": "/dashboard?kpi=cash_flow",
        "createdAt": "2025-09-25T09:45:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

### PUT /notifications/{notificationId}/read
Mark notification as read.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "message": "Notification marked as read"
  }
}
```

## 🚨 Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized  
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Application Error Codes
```javascript
const ErrorCodes = {
  "VALIDATION_ERROR": "Input validation failed",
  "AUTHENTICATION_FAILED": "Invalid credentials",
  "AUTHORIZATION_DENIED": "Insufficient permissions", 
  "RESOURCE_NOT_FOUND": "Requested resource not found",
  "RATE_LIMIT_EXCEEDED": "Too many requests",
  "KPI_CALCULATION_FAILED": "KPI calculation error",
  "REPORT_GENERATION_FAILED": "Report generation error",
  "EXTERNAL_SERVICE_ERROR": "External service unavailable",
  "DATABASE_ERROR": "Database operation failed",
  "CACHE_ERROR": "Cache operation failed"
}
```

## 📋 Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1695736200
X-RateLimit-Retry-After: 60
```

### Rate Limit Rules
```javascript
const RateLimits = {
  "default": "100 requests/minute",
  "auth_login": "5 requests/minute", 
  "reports_generate": "10 requests/hour",
  "admin_endpoints": "200 requests/minute",
  "data_export": "5 requests/hour"
}
```

## 🔒 Security Headers

### Required Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-API-Version: v1
X-Request-ID: {unique_request_id}
```

### Response Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## 📚 SDKs and Libraries

### JavaScript/TypeScript SDK
```javascript
import { DashboardBMCAPI } from '@dashboard-bmc/api-client';

const api = new DashboardBMCAPI({
  baseURL: 'https://api.dashboard-bmc.com/v1',
  apiKey: 'your-api-key'
});

// Get dashboard summary
const summary = await api.dashboard.getSummary({
  period: '30d'
});

// Generate report
const report = await api.reports.generate({
  templateId: 'monthly_summary',
  format: 'pdf'
});
```

### Python SDK
```python
from dashboard_bmc import DashboardBMCAPI

api = DashboardBMCAPI(
    base_url='https://api.dashboard-bmc.com/v1',
    api_key='your-api-key'
)

# Get KPIs
kpis = api.dashboard.get_kpis(period='30d')

# Generate report
report = api.reports.generate(
    template_id='monthly_summary',
    format='pdf'
)
```

---

*Complete API documentation for Dashboard BMC - Ready for implementation*