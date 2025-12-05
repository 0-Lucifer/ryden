# Ryden Authentication System Documentation

## Overview

The Ryden platform features a complete authentication system with multiple authentication methods, role-based access control (rider/driver), and comprehensive security features.

## Authentication Methods

### 1. Email/Password Authentication
- **Registration**: Create account with email, password, name, phone, and role selection
- **Login**: Sign in with email and password
- **Password Reset**: Secure password recovery via email verification code
- **Password Requirements**: 
  - Minimum 8 characters
  - Must contain uppercase, lowercase, and numbers
  - Must not contain easily guessable patterns

### 2. Phone Verification (OTP)
- **Send OTP**: Triggered after successful signup
- **Verify OTP**: 6-digit code sent via SMS or backend service
- **Optional**: Users can skip verification during signup but should verify later
- **Expiration**: OTP codes expire after 10 minutes

### 3. Social Login (Future Implementation)
- Google Sign-In
- Facebook Login
- Apple Sign-In
- Infrastructure ready in `AuthService.socialLogin()`

## File Structure

### Frontend Components

#### Authentication Screens

1. **`app/login.tsx`** (170 lines)
   - Email/password login form
   - Real-time validation with error messages
   - Loading state management
   - "Forgot Password?" link
   - Social login button placeholders
   - Auto-routes to home on successful login

2. **`app/signup.tsx`** (250+ lines)
   - Full registration form with fields:
     - Full Name (2+ characters)
     - Email (valid format)
     - Phone Number (10+ digits)
     - Password (8+ chars, complexity rules)
     - Confirm Password (must match)
     - Role Selection (Rider/Driver toggle)
   - Real-time validation with per-field error messages
   - Password visibility toggle
   - Loading state prevents double submission
   - Auto-routes to home on successful signup

3. **`app/forgot-password.tsx`** (300+ lines)
   - 3-step password reset flow:
     - Step 1: Email entry
     - Step 2: OTP verification code (6 digits)
     - Step 3: New password with confirmation
   - Real-time validation
   - Resend code timer (120 seconds)
   - Loading states on all operations
   - Routes back to login after successful reset

4. **`app/otp-verify.tsx`** (180+ lines)
   - Phone verification via OTP
   - 6-digit code input with auto-formatting
   - Resend button with countdown timer
   - Skip verification option
   - Error handling and retries
   - Routes to home on successful verification

### Services

**`services/auth.service.ts`** (300+ lines)
Authentication API client managing:
- `register(RegisterData)` - User registration
- `login(LoginData)` - User login
- `sendOTP(phone)` - Send verification code
- `verifyOTP(OTPVerification)` - Verify code
- `socialLogin(provider, token)` - Social auth
- `refreshToken()` - Token refresh
- `logout()` - Sign out
- `sendPasswordResetEmail(email)` - Request password reset
- `verifyPasswordResetCode(email, code)` - Verify reset code
- `resetPassword(email, code, password)` - Complete password reset
- `uploadStudentID(file)` - Verify student status
- Token and user data persistence to AsyncStorage

### Context

**`context/AuthContext.tsx`** (134 lines)
Global authentication state management:
- `useAuth()` hook for accessing auth state
- User data state management
- Authentication methods (login, register, logout)
- WebSocket connection on auth
- Auto-check auth status on app load

## API Integration

All authentication requests go through `ApiService` to the backend Auth Service running on port 3001.

### Backend Endpoints

```
POST /auth/register          - Register new user
POST /auth/login             - User login
POST /auth/send-otp          - Send verification OTP
POST /auth/verify-otp        - Verify OTP code
POST /auth/social-login      - Social authentication
POST /auth/refresh-token     - Refresh access token
POST /auth/logout            - User logout
POST /auth/send-password-reset - Request password reset
POST /auth/verify-reset-code - Verify reset code
POST /auth/reset-password    - Reset password
POST /auth/verify-student-id - Upload student ID
```

## Data Flow

### Registration Flow
```
1. User fills signup form
2. Frontend validates all fields
3. Submit to AuthService.register()
4. Backend creates user account
5. Backend returns tokens and user data
6. Frontend saves to AsyncStorage
7. Frontend sets auth header
8. Frontend shows OTP verification screen (optional)
9. Navigation to home on completion
```

### Login Flow
```
1. User enters email and password
2. Frontend validates credentials format
3. Submit to AuthService.login()
4. Backend authenticates user
5. Backend returns tokens and user data
6. Frontend saves to AsyncStorage
7. Frontend sets auth header
8. Navigation to home
```

### Password Reset Flow
```
1. User enters email on forgot password screen
2. AuthService.sendPasswordResetEmail() called
3. Backend sends verification code to email
4. User enters code on second screen
5. AuthService.verifyPasswordResetCode() called
6. User enters new password on third screen
7. AuthService.resetPassword() called
8. Backend updates password
9. Navigation back to login
```

### OTP Verification Flow
```
1. After signup, navigate to otp-verify
2. User enters 6-digit code
3. AuthService.verifyOTP() called
4. Backend verifies code
5. Backend marks phone as verified
6. Navigation to home
```

## Storage & Persistence

### AsyncStorage Keys

- `auth_token` - JWT access token
- `refresh_token` - JWT refresh token
- `user_data` - Serialized user object

### Token Management

- **Access Token**: Short-lived token for API requests (expiration set by backend)
- **Refresh Token**: Long-lived token to obtain new access tokens
- **Auto-Refresh**: Triggered when access token expires
- **Logout**: Clears all tokens from storage and headers

## Security Features

### Input Validation
- Email format validation
- Password strength requirements
- Phone number validation (10+ digits)
- Required field checks
- Name length validation

### Error Handling
- User-friendly error messages
- No sensitive data in error logs
- Graceful fallbacks
- Alert dialogs for critical errors

### Token Security
- Tokens stored in secure AsyncStorage
- Auto-refresh on expiration
- Clear on logout
- Included in request headers

### User Role Management
- Rider/Driver role selection during signup
- Role stored in user data
- Used for conditional UI/feature access

## User Data Structure

```typescript
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  university: string;
  role: 'rider' | 'driver' | 'both';
  isVerified: boolean;
  rating: number;
  totalRides: number;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}
```

## State Management

### AuthContext State
```typescript
{
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => void;
}
```

## Usage Examples

### Login
```tsx
import { useAuth } from '@/context/AuthContext';

function LoginScreen() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ email, password });
      // Auto-navigate via router
    } catch (error) {
      // Handle error
    }
  };
}
```

### Sign Up
```tsx
const { register, isLoading } = useAuth();

const handleSignup = async () => {
  await register({
    name,
    email,
    phone,
    password,
    role: 'rider',
    university: 'North South University',
  });
};
```

### Protected Navigation
```tsx
import { useAuth } from '@/context/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <SplashScreen />;
  
  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
```

## Testing Auth Flow

1. **Start the app**: `npm start` (frontend)
2. **Backend running**: `docker-compose up -d` (backend)
3. **Test Signup**:
   - Go to signup screen
   - Fill all fields (use valid email format)
   - Password must meet complexity requirements
   - Click "Create Account"
   - Should navigate to home

4. **Test Login**:
   - Go to login screen
   - Use credentials from signup
   - Click "Log In"
   - Should navigate to home

5. **Test Forgot Password**:
   - On login screen click "Forgot Password?"
   - Enter registered email
   - Enter code from backend/email
   - Enter new password
   - Should navigate back to login

6. **Test OTP Verification**:
   - After signup, verify phone with OTP
   - Enter 6-digit code
   - Should navigate to home

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Account exists | Go to login or use different email |
| "Invalid credentials" | Wrong email/password | Check credentials and try again |
| "Password too weak" | Doesn't meet requirements | Use uppercase, lowercase, numbers |
| "Network error" | Backend not running | Check Docker containers: `docker-compose ps` |
| "Token expired" | Access token expired | Auto-refresh triggered, retry request |
| "Invalid OTP" | Wrong code | Check SMS for correct code |

## Backend Service Requirements

Auth Service must implement these endpoints:

```javascript
// Authentication endpoints
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh-token

// OTP endpoints
POST /auth/send-otp
POST /auth/verify-otp

// Password reset endpoints
POST /auth/send-password-reset
POST /auth/verify-reset-code
POST /auth/reset-password

// Social login
POST /auth/social-login

// Student verification
POST /auth/verify-student-id
```

## Future Enhancements

- [ ] Biometric authentication (fingerprint, face recognition)
- [ ] Two-factor authentication (2FA)
- [ ] Social login implementation (Google, Facebook)
- [ ] Email verification after signup
- [ ] Security questions as backup
- [ ] Account recovery flows
- [ ] Session management
- [ ] Device trust/remembered devices
- [ ] Login attempt rate limiting
- [ ] Suspicious activity detection

## Troubleshooting

### Users can't receive OTP codes
- Check backend SMS service configuration
- Verify phone number format is correct
- Check network connectivity

### Password reset code not working
- Verify code hasn't expired (10 minute window)
- Check email wasn't sent to spam
- Ensure correct email address

### Login fails with valid credentials
- Check if user account exists
- Verify password is correct
- Check backend is running on port 3001
- Check AsyncStorage isn't corrupted

### Tokens not persisting after restart
- Check AsyncStorage permissions
- Verify file system access
- Check for AsyncStorage storage limit exceeded

## Support

For issues or questions about authentication:
1. Check error messages in console
2. Verify backend endpoints are responding
3. Check AsyncStorage contents via React DevTools
4. Review network tab in browser dev tools
5. Check backend service logs: `docker logs backend_auth_1`
