# Ryden Authentication Quick Start Guide

## What Was Built

A complete user authentication system with:
- ✅ **Login Screen** - Email/password authentication
- ✅ **Signup Screen** - Full registration with validation
- ✅ **OTP Verification** - Phone verification after signup
- ✅ **Password Reset** - 3-step forgot password flow
- ✅ **Role Selection** - Rider or Driver account type
- ✅ **Token Management** - Secure storage and refresh
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Loading States** - Prevents double submission
- ✅ **Form Validation** - Real-time validation on all fields

## File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `app/login.tsx` | Login screen | 175 |
| `app/signup.tsx` | Registration screen | 284 |
| `app/otp-verify.tsx` | Phone verification | 194 |
| `app/forgot-password.tsx` | Password reset | 291 |
| `context/AuthContext.tsx` | Global auth state | 134 |
| `services/auth.service.ts` | Auth API client | 262 |
| `AUTH.md` | Full documentation | - |

## How to Test

### 1. Prerequisites
- ✅ Docker running with backend services: `docker-compose up -d`
- ✅ Frontend running: `npm start`
- ✅ App open in Expo Go or web browser

### 2. Test Signup
1. Click "Create Account" / "Sign Up" button
2. Fill form:
   - Name: "John Doe" (2+ chars)
   - Email: "john@example.com" (must have @)
   - Phone: "1234567890" (10+ digits)
   - Password: "SecurePass123" (8+ chars, uppercase, lowercase, numbers)
   - Confirm: Same as password
   - Role: Select "Find Rides" or "Offer Rides"
3. Click "Create Account"
4. **Expected**: Navigate to home OR show OTP verification screen
5. If OTP screen: Enter code and verify

### 3. Test Login
1. Go to login screen
2. Enter your signup credentials:
   - Email: john@example.com
   - Password: SecurePass123
3. Click "Log In"
4. **Expected**: Navigate to home screen with authenticated user

### 4. Test Forgot Password
1. On login screen, click "Forgot Password?"
2. Enter registered email
3. Click "Send Reset Code"
4. Enter 6-digit code from backend
5. Enter new password (same rules as signup)
6. Click "Reset Password"
7. **Expected**: Navigate back to login with success message

### 5. Test Form Validation
Try invalid inputs to see error messages:
- Email: "notanemail" → Error: "Please enter a valid email"
- Password: "short" → Error: "Password must be at least 8 characters"
- Passwords don't match → Error: "Passwords do not match"
- Empty fields → Error: "[Field] is required"

## Authentication Flow

### User Signs Up
```
Signup Screen → Fill Form → Validate → Register API Call
→ Backend Creates Account → Returns Tokens → Save to Storage
→ OTP Verification (Optional) → Navigate to Home
```

### User Logs In
```
Login Screen → Enter Credentials → Validate → Login API Call
→ Backend Authenticates → Returns Tokens → Save to Storage
→ Set Auth Header → Navigate to Home
```

### User Resets Password
```
Forgot Password → Enter Email → Get Reset Code
→ Enter Code → Enter New Password → Reset API Call
→ Backend Updates Password → Navigate to Login
```

## Key Features

### Form Validation
- **Real-time**: Errors clear as you type
- **Specific**: Each field has its own error message
- **Helpful**: Error messages tell you how to fix the issue
- **Visual**: Error fields have red borders

### Password Requirements
- Minimum 8 characters
- Must have uppercase (A-Z)
- Must have lowercase (a-z)
- Must have number (0-9)
- Password and confirm must match

### Phone Number
- Minimum 10 digits
- Digits only (spaces, dashes removed)

### Email
- Must contain @ symbol
- Validated on each screen

### Loading States
- Buttons disabled during API calls
- Loading spinner on submit button
- Prevents double submission
- Clear when done

## API Endpoints Used

All auth requests go to `http://localhost:3001` (Auth Service):

```
POST /auth/register              → Create account
POST /auth/login                 → Sign in
POST /auth/send-otp              → Send verification code
POST /auth/verify-otp            → Verify phone
POST /auth/send-password-reset   → Request password reset
POST /auth/verify-reset-code     → Verify reset code
POST /auth/reset-password        → Complete password reset
POST /auth/logout                → Sign out
POST /auth/refresh-token         → Get new access token
```

## How It Works Behind the Scenes

### 1. Data Storage
- Access & Refresh tokens saved to AsyncStorage
- User data (name, email, role) saved to AsyncStorage
- Tokens included in all API request headers

### 2. Token Management
- Access token: Short-lived (expires based on backend)
- Refresh token: Long-lived (for getting new access tokens)
- Auto-refresh: Triggered when access token expires
- Logout: Clears all tokens

### 3. Global State
- All screens access auth state via `useAuth()` hook
- User data available to entire app
- Auth status checked on app startup

### 4. Error Handling
- Backend errors → User-friendly alert
- Network errors → Retry option
- Validation errors → Per-field error messages

## Code Examples

### Access Auth in Any Screen
```tsx
import { useAuth } from '@/context/AuthContext';

function MyScreen() {
  const { user, isLoading, login, logout } = useAuth();
  
  return (
    <View>
      <Text>Welcome {user?.name}!</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Programmatic Navigation After Login
```tsx
const handleLogin = async () => {
  try {
    await login({ email, password });
    router.replace('/(tabs)'); // Auto-navigate to home
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Add Custom Validation
```tsx
const validateCustomField = (value: string): boolean => {
  if (value.includes('admin')) {
    setErrors({ ...errors, field: 'Admin is reserved' });
    return false;
  }
  return true;
};
```

## Troubleshooting

### "Email already registered"
**Problem**: User tries to signup with existing email
**Solution**: Go to login or signup with different email

### "Invalid credentials"
**Problem**: Wrong email or password on login
**Solution**: Check email and password, try again

### "Network Error"
**Problem**: Backend not running
**Solution**: 
```bash
docker-compose up -d
docker-compose ps  # Check all services running
```

### "Token Expired"
**Problem**: Session ended
**Solution**: Log in again

### Cannot receive OTP
**Problem**: SMS service not configured
**Solution**: Check backend logs: `docker logs backend_auth_1`

### Password reset code not working
**Problem**: Code expired (10 min window) or incorrect
**Solution**: Request new code

## Next Steps

1. **Test all auth flows** with different data
2. **Check backend logs** for API errors: `docker logs backend_auth_1`
3. **Monitor network** in browser DevTools → Network tab
4. **Add more validation** as needed
5. **Integrate social login** (Google, Facebook)
6. **Add 2FA** if required
7. **Customize error messages** for your brand

## File Summary

### Login (`app/login.tsx`)
- Email/password login
- Real-time validation
- Forgot password link
- Loading state
- Social buttons (UI only)

### Signup (`app/signup.tsx`)
- Register with email/password
- Phone number collection
- Role selection (Rider/Driver)
- Form validation
- Confirm password matching
- Password visibility toggle

### OTP Verification (`app/otp-verify.tsx`)
- 6-digit code input
- Auto-format numbers only
- Resend timer (120 seconds)
- Skip option
- Error handling

### Forgot Password (`app/forgot-password.tsx`)
- 3-step flow (Email → Code → Password)
- Reset code verification
- New password requirements
- Password visibility toggle
- Resend code option

### Auth Service (`services/auth.service.ts`)
- API client for all auth endpoints
- Token management
- AsyncStorage persistence
- Error handling

### Auth Context (`context/AuthContext.tsx`)
- Global state provider
- `useAuth()` hook
- User data management
- WebSocket integration

## Support

- **Errors in console?** Check browser DevTools → Console tab
- **API not responding?** Check backend: `docker-compose ps`
- **Can't login?** Check AsyncStorage in React DevTools
- **Need more docs?** See `AUTH.md` for complete reference
