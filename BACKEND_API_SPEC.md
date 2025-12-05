# Backend Authentication API Specification

## Overview
This document specifies the authentication endpoints that the Auth Service (running on port 3001) must implement to support the Ryden frontend authentication system.

## Base URL
```
http://localhost:3001
```

## Authentication Header
All authenticated requests should include:
```
Authorization: Bearer {accessToken}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error code",
  "message": "Human-readable error message"
}
```

## Endpoints

### 1. Register (Create Account)
**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123",
  "role": "rider",
  "university": "North South University",
  "studentId": "NSU123456"  // optional
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "university": "North South University",
      "role": "rider",
      "isVerified": false,
      "rating": 0,
      "totalRides": 0
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "message": "Registration successful"
}
```

**Error Cases**:
- Email already exists: `"Email already registered"`
- Invalid email: `"Invalid email format"`
- Weak password: `"Password must be at least 8 characters"`
- Missing fields: `"{field} is required"`

---

### 2. Login
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "university": "North South University",
      "role": "rider",
      "isVerified": true,
      "rating": 4.5,
      "totalRides": 10,
      "profilePicture": "https://..."
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "message": "Login successful"
}
```

**Error Cases**:
- User not found: `"User not found"`
- Invalid password: `"Invalid credentials"`
- Account not verified: `"Please verify your email first"`

---

### 3. Send OTP (Phone Verification)
**Endpoint**: `POST /auth/send-otp`

**Request Body**:
```json
{
  "phone": "1234567890"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "OTP sent to your phone"
}
```

**Implementation Notes**:
- Generate 6-digit OTP code
- Send via SMS using Twilio/similar service (see `services/auth/services/twilio.service.js`)
- Store OTP in cache with 10-minute expiration
- Return masked phone in response: `"+1234****890"`

**Error Cases**:
- Invalid phone: `"Invalid phone number format"`
- SMS service error: `"Failed to send OTP"`
- Too many attempts: `"Too many OTP requests. Try again later."`

---

### 4. Verify OTP (Confirm Phone)
**Endpoint**: `POST /auth/verify-otp`

**Request Body**:
```json
{
  "phone": "1234567890",
  "otp": "123456"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Phone verified successfully"
}
```

**Implementation Notes**:
- Compare provided OTP with stored OTP
- Mark user's phone as verified
- Clear OTP from cache
- Update `isVerified` field for user

**Error Cases**:
- Invalid OTP: `"Invalid OTP code"`
- OTP expired: `"OTP has expired. Request a new code."`
- Phone not found: `"Phone not registered"`

---

### 5. Send Password Reset Email
**Endpoint**: `POST /auth/send-password-reset`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Password reset code sent to your email"
}
```

**Implementation Notes**:
- Check if email exists
- Generate 6-digit reset code
- Send code via email (transactional email service)
- Store code in cache with 10-minute expiration
- Log this action for security audit

**Error Cases**:
- Email not found: `"Email not registered"`
- Too many attempts: `"Too many reset requests. Try again in 1 hour."`
- Email service down: `"Failed to send email. Try again later."`

---

### 6. Verify Password Reset Code
**Endpoint**: `POST /auth/verify-reset-code`

**Request Body**:
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Code verified. You can now reset your password."
}
```

**Implementation Notes**:
- Verify code matches stored code for this email
- Check if code hasn't expired
- Mark this user as able to reset password (temp token or session)
- Clear code from cache after validation

**Error Cases**:
- Invalid code: `"Invalid reset code"`
- Code expired: `"Reset code has expired. Request a new one."`
- Too many attempts: `"Too many failed attempts. Request a new code."`

---

### 7. Reset Password
**Endpoint**: `POST /auth/reset-password`

**Request Body**:
```json
{
  "email": "john@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

**Implementation Notes**:
- Verify code is valid for this email
- Hash new password with bcrypt
- Update user password in database
- Clear all sessions/tokens (force re-login)
- Send confirmation email
- Log this action for security audit
- Clear code from cache

**Error Cases**:
- Invalid code: `"Invalid or expired code"`
- Weak password: `"Password must meet security requirements"`
- Code not verified: `"Please verify code first"`

---

### 8. Refresh Access Token
**Endpoint**: `POST /auth/refresh-token`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  },
  "message": "Token refreshed"
}
```

**Implementation Notes**:
- Verify refresh token signature
- Check if refresh token hasn't expired
- Generate new access token
- Return new access token (same expiry as original)
- Don't return new refresh token (only if old one expires)

**Error Cases**:
- Invalid token: `"Invalid refresh token"`
- Token expired: `"Refresh token has expired. Please login again."`
- Malformed token: `"Malformed token"`

---

### 9. Logout
**Endpoint**: `POST /auth/logout`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGc..."  // optional
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation Notes**:
- Add access token to blacklist/invalidate
- Add refresh token to blacklist if provided
- Clear any user sessions
- Log this action for audit trail
- Send logged-out confirmation email (optional)

**Error Cases**:
- Token not provided: Still return success (idempotent)
- Invalid token: Still return success (already logged out)

---

### 10. Social Login (Future)
**Endpoint**: `POST /auth/social-login`

**Request Body**:
```json
{
  "provider": "google",  // or "facebook", "apple"
  "token": "googleToken..."
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@google.com",
      "role": "rider",
      // ... other user fields
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    },
    "isNewUser": true  // true if first time login
  },
  "message": "Social login successful"
}
```

**Implementation Notes**:
- Verify token with Google/Facebook/Apple
- Extract user info from token
- Create user if doesn't exist
- Return new or existing user
- For new users, return `isNewUser: true` to trigger onboarding

**Error Cases**:
- Invalid provider: `"Invalid social login provider"`
- Invalid token: `"Invalid social login token"`
- Provider error: `"Failed to verify with provider"`

---

### 11. Verify Student ID
**Endpoint**: `POST /auth/verify-student-id`

**Request Body**:
```
Content-Type: multipart/form-data
Form Data:
- document: [file object]
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "studentId": "NSU123456",
    "status": "pending"  // or "verified", "rejected"
  },
  "message": "Document uploaded for verification"
}
```

**Implementation Notes**:
- Accept image/PDF files (max 5MB)
- Store file in cloud storage
- Set verification status to "pending"
- Queue for manual review or OCR
- Send confirmation email
- Return temp status (will be updated after review)

**Error Cases**:
- Invalid file type: `"Only PDF and image files are accepted"`
- File too large: `"File must be less than 5MB"`
- Already verified: `"Student ID already verified"`

---

## Error Codes

Standard error codes for all endpoints:

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `INVALID_INPUT` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Authentication Flow Examples

### Example 1: Complete Signup & Verification
```
1. POST /auth/register
   ↓ Returns accessToken, refreshToken
   ↓ Frontend saves tokens to AsyncStorage
   
2. POST /auth/send-otp (for phone verification)
   ↓ Backend sends OTP via SMS
   
3. POST /auth/verify-otp
   ↓ Phone verified
   ↓ User marked as verified
```

### Example 2: Login with Token Refresh
```
1. POST /auth/login
   ↓ Returns accessToken (30 min expiry), refreshToken (7 day expiry)
   
2. Frontend makes API call after 30 min
   ↓ Access token expired
   
3. POST /auth/refresh-token with refreshToken
   ↓ Returns new accessToken
   ↓ Frontend continues with new token
```

### Example 3: Password Reset
```
1. POST /auth/send-password-reset
   ↓ Code sent to email
   
2. User receives code and enters it
   
3. POST /auth/verify-reset-code
   ↓ Code validated
   
4. POST /auth/reset-password
   ↓ Password updated
   ↓ All sessions invalidated
   ↓ User must login again
```

---

## Security Requirements

### Password Policy
- Minimum 8 characters
- Must contain uppercase (A-Z)
- Must contain lowercase (a-z)
- Must contain number (0-9)
- Cannot be previous password
- Cannot contain username

### Token Generation
- Use JWT with RS256 algorithm
- Access token expiry: 30 minutes
- Refresh token expiry: 7 days
- Include `userId` and `role` in token

### Rate Limiting
- 5 failed login attempts → lock account for 15 min
- 3 failed OTP attempts → regenerate code
- 1 password reset per hour per user

### Audit Logging
- Log all authentication events
- Log failed attempts
- Log password resets
- Include timestamp and user ID

### Email Notifications
- Send verification email after signup
- Send password reset confirmation
- Send suspicious activity alerts
- Send session timeout warning

---

## Testing Endpoints

### Test User
```
Email: test@example.com
Password: TestPassword123
Phone: 1234567890
OTP Code: 000000
Reset Code: 000000
```

### Test Commands
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "SecurePass123",
    "role": "rider",
    "university": "North South University"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Send OTP
curl -X POST http://localhost:3001/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890"}'
```

---

## Implementation Checklist

Backend team should implement:

- [ ] POST /auth/register - User registration
- [ ] POST /auth/login - User login
- [ ] POST /auth/send-otp - Send verification code
- [ ] POST /auth/verify-otp - Verify phone
- [ ] POST /auth/send-password-reset - Send reset code
- [ ] POST /auth/verify-reset-code - Verify reset code
- [ ] POST /auth/reset-password - Complete password reset
- [ ] POST /auth/refresh-token - Refresh access token
- [ ] POST /auth/logout - User logout
- [ ] POST /auth/verify-student-id - Upload student ID
- [ ] Password hashing with bcrypt
- [ ] JWT token generation and validation
- [ ] OTP generation and verification
- [ ] Email sending for password reset
- [ ] SMS sending for OTP (optional, can mock)
- [ ] Rate limiting
- [ ] Error handling
- [ ] Audit logging
- [ ] Input validation
- [ ] CORS configuration

---

## Notes

- All timestamps in ISO 8601 format
- Phone numbers stored without formatting (digits only)
- All passwords hashed with bcrypt (at least 12 rounds)
- All sensitive data encrypted at rest
- All endpoints should support both JSON and form data
- CORS headers should allow frontend origin
