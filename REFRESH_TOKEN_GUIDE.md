# Refresh Token Implementation Guide

## Overview
This implementation adds secure refresh token functionality to your QR Menu SaaS application. It uses JWT for access tokens and database-stored refresh tokens with automatic token rotation.

## Architecture

### Token Types
1. **Access Token** (JWT)
   - Short-lived: 1 hour
   - Stored in localStorage as `token`
   - Used for API authorization
   - Contains: user_id, name, email, tenant_id

2. **Refresh Token** (Random String)
   - Long-lived: 30 days
   - Stored in database + localStorage as `refresh_token`
   - Used to obtain new access tokens
   - Automatically rotated on refresh

## Database Setup

### 1. Run the migration
```sql
-- Run this SQL script on your database
source sql/add_refresh_tokens.sql;
```

This creates:
- `refresh_tokens` table with columns: id, user_id, token, expires_at, created_at, revoked_at
- `last_login_at` column in users table
- Proper indexes for performance

## Backend Files Created/Modified

### New Files:
1. **`backend/src/services/RefreshTokenService.php`**
   - Manages refresh token CRUD operations
   - Methods: storeRefreshToken(), validateRefreshToken(), revokeToken(), revokeAllUserTokens()

2. **`backend/api/refresh.php`**
   - Endpoint: `POST /api/auth/refresh`
   - Validates refresh token and issues new access + refresh tokens
   - Implements token rotation (revokes old token)

3. **`backend/api/logout.php`**
   - Endpoint: `POST /api/auth/logout`
   - Revokes refresh tokens on logout

### Modified Files:
1. **`backend/src/auth/JwtAuth.php`**
   - Updated `createToken()` to use 1-hour expiry
   - Added `createRefreshToken()` method
   - Added 'type' field to tokens

2. **`backend/api/login.php`**
   - Returns both `access_token` and `refresh_token`
   - Stores refresh token in database
   - Updates last_login_at timestamp

3. **`backend/api/register.php`**
   - Returns both tokens on registration
   - Consistent with login response format

4. **`backend/index.php`**
   - Added routes for `/api/auth/refresh` and `/api/auth/logout`

## Frontend Files Modified

### 1. **`frontend/src/api/axios.ts`**
- Implements automatic token refresh on 401 errors
- Request queuing during refresh to prevent race conditions
- Falls back to login page if refresh fails

Key features:
- Detects 401 errors
- Attempts token refresh using refresh_token
- Retries failed requests with new token
- Queues concurrent requests during refresh

### 2. **`frontend/src/context/AuthContext.tsx`**
- Added `refreshToken` state
- Updated `login()` to handle access_token and refresh_token
- Updated `logout()` to call backend and clear refresh token
- Modified token expiry check with 30-second buffer

### 3. **`frontend/src/hooks/useTokenExpirationCheck.ts`**
- Periodic check for token expiration (every 60 seconds)
- Automatically triggers logout when token expires

## API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "abc123...xyz789",
    "user": { ... },
    "tenant": { ... }
  }
}
```

### POST /api/auth/refresh
**Request:**
```json
{
  "refresh_token": "abc123...xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "new_abc123...xyz789",
    "user": { ... },
    "tenant": { ... }
  }
}
```

### POST /api/auth/logout
**Request:**
```json
{
  "refresh_token": "abc123...xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Security Features

1. **Token Rotation**: Old refresh token is revoked when issuing a new one
2. **Database Storage**: Refresh tokens stored in DB, can be revoked server-side
3. **Expiration**: Both token types have expiration times
4. **Revocation**: Support for revoking individual or all user tokens
5. **Automatic Cleanup**: Method to clean up expired tokens

## Usage Flow

### Login Flow:
1. User submits credentials
2. Backend validates and creates access + refresh tokens
3. Both tokens stored in localStorage
4. Access token used for API calls

### Token Refresh Flow:
1. Access token expires (1 hour)
2. API returns 401 error
3. Frontend interceptor catches 401
4. Automatically calls /auth/refresh with refresh_token
5. Receives new access_token and refresh_token
6. Retries original request
7. User experiences seamless continuation

### Logout Flow:
1. User clicks logout
2. Frontend calls /auth/logout endpoint
3. Backend revokes refresh tokens
4. Frontend clears localStorage
5. User redirected to login

## Testing

1. **Test Login**: Verify both tokens are returned
2. **Test API Calls**: Verify access token is used
3. **Test Token Expiry**: Wait 1 hour or modify JWT expiry to test auto-refresh
4. **Test Logout**: Verify tokens are cleared and revoked
5. **Test Invalid Refresh**: Try using revoked/expired refresh token

## Maintenance

### Cleanup Expired Tokens
Run periodically (e.g., daily cron job):
```php
<?php
require_once __DIR__ . '/bootstrap.php';
use App\Services\DB;
use App\Services\RefreshTokenService;

$pdo = DB::getPDO($config);
$refreshTokenSvc = new RefreshTokenService($pdo);
$deleted = $refreshTokenSvc->cleanupExpiredTokens();
echo "Deleted {$deleted} expired tokens\n";
```

## Configuration

### Adjust Token Lifetimes
In your endpoints:
```php
// Access token: 1 hour (3600 seconds)
$accessToken = $jwt->createToken($payload, 3600);

// Refresh token: 30 days
$refreshTokenSvc->storeRefreshToken($userId, $refreshToken, 30);
```

## Troubleshooting

### Issue: "Invalid or expired refresh token"
- Check if token exists in database
- Verify token hasn't been revoked (revoked_at IS NULL)
- Check expires_at timestamp

### Issue: "Infinite redirect loop"
- Ensure refresh endpoint doesn't require authentication
- Check if refresh_token exists in localStorage
- Verify axios interceptor logic

### Issue: "Token still works after logout"
- Access tokens remain valid until expiry (by design)
- Only refresh tokens are revoked
- For instant invalidation, implement token blacklist

## Migration from Old System

If migrating from the old single-token system:

1. Run database migration
2. Update backend files as shown
3. Update frontend files as shown
4. Users will need to re-login to get refresh tokens
5. Old access tokens will continue working until expiry

## Benefits

✅ Enhanced security with short-lived access tokens
✅ Better user experience (no forced re-login every hour)
✅ Server-side token revocation capability
✅ Automatic token refresh handling
✅ Token rotation prevents token reuse attacks
