# Backend Integration Guide

## Overview
This app is integrated with a microservices backend architecture for NSU ride-sharing platform. The backend includes 8 independent services communicating through an API Gateway.

## Backend Services

### 1. **Authentication Service** (Port: 3001)
- User registration with phone/email verification
- JWT token-based authentication
- Social login (Google, Facebook)
- Student verification via university email

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/send-otp` - Send OTP for phone verification
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### 2. **User Management Service** (Port: 3002)
- Profile management
- Emergency contacts
- Document uploads (NID, license)
- Role switching (rider ↔ driver)

**Endpoints:**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/emergency-contact` - Add emergency contact
- `POST /api/users/upload-document` - Upload verification documents

### 3. **Ride Service** (Port: 3003)
- Ride request/matching
- Ride lifecycle management
- Scheduled rides
- Ride history

**Endpoints:**
- `POST /api/rides/request` - Request a new ride
- `POST /api/rides/calculate-fare` - Get fare estimate
- `GET /api/rides/active` - Get active ride
- `GET /api/rides/history` - Get ride history
- `POST /api/rides/:id/cancel` - Cancel ride

### 4. **Location & Matching Service** (Port: 3004)
- Real-time GPS tracking
- Geospatial driver search (Redis GEORADIUS)
- Matching algorithm
- Campus geofencing

**Endpoints:**
- `GET /api/location/nearby-drivers` - Find nearby drivers
- `GET /api/location/driver/:rideId` - Get driver location
- `POST /api/location/update` - Update driver location

### 5. **Payment Service** (Port: 3005)
- bKash/Nagad/Rocket integration
- SSLCommerz for card payments
- Transaction management
- Driver payouts

**Endpoints:**
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/bkash/create` - Create bKash payment
- `POST /api/payments/nagad/create` - Create Nagad payment
- `GET /api/payments/verify/:txnId` - Verify payment status
- `POST /api/payments/payout/request` - Request driver payout

### 6. **Notification Service** (Port: 3006)
- Push notifications (FCM)
- SMS notifications (Twilio)
- Email notifications

**Endpoints:**
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/history` - Get notification history

### 7. **Chat Service** (Port: 3007)
- Real-time messaging (Socket.IO)
- Message history
- Auto-deletion after 24h

**WebSocket Events:**
- `send_message` - Send chat message
- `new_message` - Receive new message
- `mark_read` - Mark messages as read

### 8. **Rating & Review Service** (Port: 3008)
- Two-way rating system
- Review management
- Low-rating alerts

**Endpoints:**
- `POST /api/ratings/rate` - Submit rating
- `GET /api/ratings/:userId` - Get user ratings

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the following variables:
- `EXPO_PUBLIC_API_GATEWAY` - Your API Gateway URL
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY` - Google Maps API key
- Firebase configuration for push notifications

### 3. Start Backend Services
Each microservice should be running independently. Use Docker Compose for easy setup:

```bash
# Clone backend repository
git clone https://github.com/your-org/ryden-backend.git

# Start all services with Docker
cd ryden-backend
docker-compose up -d
```

### 4. Database Setup
- **PostgreSQL**: User profiles, rides, payments
- **MongoDB**: Chat messages, notifications
- **Redis**: Real-time locations, caching

### 5. External Services Configuration

#### Google Maps Platform
1. Enable APIs: Geocoding, Directions, Distance Matrix, Places
2. Add API key to `.env`

#### Payment Gateways
- **bKash**: Get merchant credentials from bKash
- **Nagad**: Register as merchant
- **SSLCommerz**: Create merchant account

#### Twilio (SMS)
1. Sign up at twilio.com
2. Get Account SID and Auth Token
3. Configure in backend `.env`

#### Firebase (Push Notifications)
1. Create Firebase project
2. Add Android/iOS apps
3. Download `google-services.json` / `GoogleService-Info.plist`
4. Add to respective native folders

## API Authentication

All API requests require JWT authentication (except auth endpoints):

```typescript
headers: {
  'Authorization': 'Bearer <access_token>',
  'Content-Type': 'application/json'
}
```

Tokens are automatically managed by `ApiService` and stored in AsyncStorage.

## WebSocket Connection

Real-time features use Socket.IO:

```typescript
import WebSocketService from '@/services/websocket.service';

// Connect (automatically called after login)
await WebSocketService.connect();

// Listen for driver location updates
WebSocketService.onDriverLocationUpdate((data) => {
  console.log('Driver location:', data);
});

// Send message
WebSocketService.sendMessage(rideId, driverId, 'Hello!');
```

## Testing

### Local Development
Set API Gateway to local backend:
```
EXPO_PUBLIC_API_GATEWAY=http://192.168.1.100:3000/api
```

### Mock Data
For testing without backend, use mock services in `services/mock/` directory.

## Error Handling

All API errors are normalized and include:
- `status`: HTTP status code or error type
- `message`: Human-readable error message
- `data`: Additional error details

## Rate Limiting

API Gateway enforces rate limits:
- 1000 requests/minute per user
- 429 status code if exceeded

## Security

- JWT tokens expire after 1 hour
- Refresh tokens valid for 7 days
- All requests use HTTPS/TLS 1.3
- Sensitive data encrypted with AES-256
- PCI-DSS compliant payment processing

## Monitoring

Backend services use:
- **CloudWatch**: Logging and metrics
- **Sentry**: Error tracking
- **New Relic**: APM

## Support

For backend issues, contact:
- Backend Team: backend@ryden.bd
- Documentation: https://docs.ryden.bd
- API Status: https://status.ryden.bd

## License

Proprietary - NSU Ride-Sharing Platform
