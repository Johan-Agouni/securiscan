# SecuriScan API - Error Responses

All API responses follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {}  // Optional: field-level validation errors
}
```

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 400 | Bad Request | Validation error, malformed input |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Insufficient permissions (e.g. non-admin) |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g. email already registered) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

## Validation Errors (400)

Returned when request body/params/query fail Zod schema validation:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Auth Errors (401)

| Endpoint | Error Message |
|----------|---------------|
| POST /api/auth/login | "Invalid email or password" |
| POST /api/auth/refresh | "Invalid refresh token" |
| POST /api/auth/refresh | "Refresh token expired or not found" |
| Protected routes | "Missing or invalid authorization header" |
| Protected routes | "Invalid or expired token" |

## Resource Errors (404)

| Endpoint | Error Message |
|----------|---------------|
| GET /api/sites/:id | "Site not found" |
| GET /api/scans/:id | "Scan not found" |
| GET /api/admin/users/:id | "User not found" |
| GET /api/auth/me | "User not found" |

## Conflict Errors (409)

| Endpoint | Error Message |
|----------|---------------|
| POST /api/auth/register | "Email is already registered" |
| POST /api/sites | "Site with this URL already exists" |

## Rate Limiting (429)

| Scope | Limit | Window |
|-------|-------|--------|
| Global | 100 requests | 15 minutes |
| Auth endpoints | 10 requests | 15 minutes |
| Scan endpoints | 50 requests | 1 hour |

Response includes `Retry-After` header.

## Password Validation Rules

Passwords must satisfy all of:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

## Pagination

List endpoints return paginated data:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 42,
    "page": 1,
    "totalPages": 5
  }
}
```

Query parameters: `page` (default: 1), `limit` (default: 10, max: 100).
