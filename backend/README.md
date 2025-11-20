# Ryden Backend Services

Complete microservices backend for the NSU campus ride-sharing platform.

## Architecture Overview

```
┌─────────────────┐
│   React Native  │
│    Frontend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │ (Port 3000)
│   Authentication│
│   Rate Limiting │
└────────┬────────┘
         │
         ├─────────────┬─────────────┬─────────────┬─────────────┐
         ▼             ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │ User Service │ │ Ride Service │ │Location Svc  │
│  Port 3001   │ │  Port 3002   │ │  Port 3003   │ │  Port 3004   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

### Current Implementation Status (Skeleton Layer)
Service | Port | Status | Notes
--- | --- | --- | ---
API Gateway | 3000 | ✅ | Proxy + JWT + rate limit
Auth Service | 3001 | ✅ | Register/Login/OTP/Social/Refresh
User Service | 3002 | ✅ | Profile CRUD, avatar placeholder, stats
Ride Service | 3003 | ✅ | Request, fare calc, offer/search (stub data), cancel
Location Service | 3004 | ✅ | Redis GEO: update & nearby drivers
Payment Service | 3005 | ✅ | Initiate/verify, methods, promo/payout stubs
Notification Service | 3006 | ✅ | Mongo models, send/history/read/token
Chat Service | 3007 | ✅ | Socket.IO rooms, message persistence (24h planned)
Rating Service | 3008 | ✅ | Rate ride, user & ride ratings

Next Deep-Dive Tasks (Priority High)
1. Replace placeholder fare distance with actual distance matrix (Google Maps / internal calc).
2. Implement real ride persistence (PostgreSQL) replacing in-memory maps.
3. Attach driver assignment and matching algorithm; store ride-driver mapping in Redis.
4. Add authentication hardening: refresh token rotation, revocation list in Redis.
5. Introduce structured logging (pino) and correlation IDs propagated via gateway.
6. Add OpenAPI specs per service and aggregate at gateway.
7. Add message TTL index in Chat (currently commented intent) using Mongo TTL.
8. Add queue-based notification dispatch (e.g., Bull + Redis) for reliability.
9. Integrate payment gateways real credentials & webhook handlers (bkash/nagad/sslcommerz).
10. Implement background worker for payout settlement & rating aggregation.

Security & Hardening TODO
- Validate all input with JOI/Zod per service (currently minimal checks).
- Enforce CORS allowlist for production.
- Add rate limit middleware per sensitive route (auth/login, payments/initiate).
- Add helmet content security policies where applicable.
- Secrets management: move env vars to vault/KMS in production.

Monitoring & Observability TODO
- Add health detail endpoints (DB/Redis latency, queue depth).
- Integrate Prometheus metrics exporter per service.
- Add distributed tracing (OpenTelemetry) to gateway and downstream calls.

Testing Roadmap
Phase 1: Unit tests (utils, controllers)
Phase 2: Integration tests with docker-compose ephemeral stack
Phase 3: Load tests (ride search, location updates, chat concurrency)
Phase 4: Security scans (dependency + runtime) & fuzzing critical endpoints


┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Payment Svc   │ │Notification  │ │  Chat Svc    │ │ Rating Svc   │
│  Port 3005   │ │  Port 3006   │ │  Port 3007   │ │  Port 3008   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

         │             │             │             │
         ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │   MongoDB    │ │    Redis     │
│  Port 5432   │ │  Port 27017  │ │  Port 6379   │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Prerequisites

- **Docker & Docker Compose** (recommended)
- **Node.js** 18+ (for local development)
- **PostgreSQL** 15+
- **MongoDB** 7+
- **Redis** 7+

## Quick Start with Docker

### 1. Clone and Navigate to Backend

```powershell
cd backend
```

### 2. Configure Environment Variables

Create `.env` files for each service:

```powershell
# Gateway .env
cd gateway
Copy-Item .env.example .env
# Edit .env with your values

# Auth Service .env
cd ../services/auth
Copy-Item .env.example .env
# Edit .env with your Twilio, Google, Facebook credentials

# Repeat for other services...
```

### 3. Start All Services

```powershell
# From backend directory
docker-compose up -d
```

This will start:
- PostgreSQL (5432)
- MongoDB (27017)
- Redis (6379)
- API Gateway (3000)
- All 8 microservices (3001-3008)

### 4. Check Services Status

```powershell
docker-compose ps
```

### 5. View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

### 6. Stop Services

```powershell
docker-compose down
```

## Local Development (Without Docker)

### 1. Install PostgreSQL

```powershell
# Download from https://www.postgresql.org/download/windows/
# Create database
psql -U postgres
CREATE DATABASE ryden_db;
CREATE USER ryden WITH PASSWORD 'ryden123';
GRANT ALL PRIVILEGES ON DATABASE ryden_db TO ryden;
```

### 2. Install MongoDB

```powershell
# Download from https://www.mongodb.com/try/download/community
# Start MongoDB service
net start MongoDB
```

### 3. Install Redis

```powershell
# Download from https://github.com/microsoftarchive/redis/releases
# Or use WSL: wsl --install
# Then: sudo apt install redis-server
```

### 4. Run Database Migrations

```powershell
# Connect to PostgreSQL
psql -U ryden -d ryden_db -f database/migrations/001_init_schema.sql
```

### 5. Start Services Individually

```powershell
# Terminal 1: API Gateway
cd gateway
npm install
$env:DATABASE_URL="postgresql://ryden:ryden123@localhost:5432/ryden_db"
$env:JWT_SECRET="your-secret-key-here"
npm start

# Terminal 2: Auth Service
cd services/auth
npm install
$env:DATABASE_URL="postgresql://ryden:ryden123@localhost:5432/ryden_db"
$env:REDIS_URL="redis://localhost:6379"
$env:JWT_SECRET="your-secret-key-here"
$env:TWILIO_ACCOUNT_SID="your_twilio_sid"
$env:TWILIO_AUTH_TOKEN="your_twilio_token"
npm start

# Terminal 3-10: Other services...
```

## Database Schema

### PostgreSQL Tables

1. **users** - User accounts and profiles
2. **refresh_tokens** - JWT refresh tokens
3. **otp_verifications** - OTP codes for phone verification
4. **driver_profiles** - Driver-specific information
5. **emergency_contacts** - Emergency contact details
6. **rides** - Ride records and status
7. **payments** - Payment transactions
8. **ratings** - User ratings and reviews
9. **promo_codes** - Promotional discount codes
10. **driver_payouts** - Driver payout requests

### MongoDB Collections

1. **messages** - Chat messages (auto-delete after 24h)
2. **notifications** - Push notification history

### Redis Keys

1. **driver_locations** - Real-time driver GPS coordinates (GEOSPATIAL)
2. **active_rides** - Active ride sessions
3. **rate_limits** - API rate limiting counters
4. **sessions** - User session data

## API Endpoints

### Auth Service (Port 3001)

```http
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/send-otp          - Send OTP
POST   /api/auth/verify-otp        - Verify OTP
POST   /api/auth/refresh-token     - Refresh access token
POST   /api/auth/social-login      - Google/Facebook login
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user
POST   /api/auth/change-password   - Change password
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with OTP
```

### User Service (Port 3002)

```http
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update profile
POST   /api/users/upload-avatar    - Upload profile image
POST   /api/users/emergency-contact - Add emergency contact
GET    /api/users/stats            - Get user statistics
```

### Ride Service (Port 3003)

```http
POST   /api/rides/request          - Request a ride
POST   /api/rides/calculate-fare   - Calculate fare estimate
GET    /api/rides/active           - Get active ride
GET    /api/rides/history          - Get ride history
POST   /api/rides/:id/accept       - Accept ride (driver)
POST   /api/rides/:id/cancel       - Cancel ride
POST   /api/rides/:id/start        - Start ride (driver)
POST   /api/rides/:id/complete     - Complete ride (driver)
GET    /api/rides/scheduled        - Get scheduled rides
```

### Location Service (Port 3004)

```http
GET    /api/location/nearby-drivers - Find nearby drivers
POST   /api/location/update         - Update driver location
GET    /api/location/driver/:rideId - Get driver location for ride
POST   /api/location/geocode        - Geocode address
POST   /api/location/reverse-geocode - Reverse geocode coordinates
```

### Payment Service (Port 3005)

```http
GET    /api/payments/methods        - Get payment methods
POST   /api/payments/initiate       - Initiate payment
POST   /api/payments/bkash/create   - Create bKash payment
POST   /api/payments/nagad/create   - Create Nagad payment
GET    /api/payments/verify/:txnId  - Verify payment
GET    /api/payments/history        - Get transaction history
GET    /api/payments/wallet         - Get wallet balance (driver)
POST   /api/payments/payout/request - Request payout (driver)
POST   /api/payments/promo/apply    - Apply promo code
```

### Notification Service (Port 3006)

```http
POST   /api/notifications/send      - Send notification
GET    /api/notifications/history   - Get notification history
PUT    /api/notifications/read/:id  - Mark as read
POST   /api/notifications/token     - Register FCM token
```

### Chat Service (Port 3007)

WebSocket connection required. HTTP endpoints:

```http
GET    /api/chat/messages/:rideId   - Get chat history
POST   /api/chat/mark-read/:rideId  - Mark messages as read
```

### Rating Service (Port 3008)

```http
POST   /api/ratings/rate            - Submit rating
GET    /api/ratings/:userId         - Get user ratings
GET    /api/ratings/ride/:rideId    - Get ride ratings
```

## Configuration

### Required Environment Variables

Create `.env` files in each service directory:

#### Gateway

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
AUTH_SERVICE_URL=http://auth-service:3001
USER_SERVICE_URL=http://user-service:3002
RIDE_SERVICE_URL=http://ride-service:3003
LOCATION_SERVICE_URL=http://location-service:3004
PAYMENT_SERVICE_URL=http://payment-service:3005
NOTIFICATION_SERVICE_URL=http://notification-service:3006
CHAT_SERVICE_URL=http://chat-service:3007
RATING_SERVICE_URL=http://rating-service:3008
```

#### Auth Service

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://ryden:ryden123@postgres:5432/ryden_db
REDIS_URL=redis://:ryden123@redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

### External Services Setup

#### 1. Twilio (SMS)

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add to `.env`

#### 2. bKash Payment Gateway

1. Register as merchant at https://www.bkash.com
2. Get App Key, App Secret, Username, Password
3. Add to Payment Service `.env`

#### 3. Google Maps API

1. Create project at https://console.cloud.google.com
2. Enable: Geocoding, Directions, Distance Matrix APIs
3. Add API key to Location Service `.env`

#### 4. Firebase (Push Notifications)

1. Create project at https://console.firebase.google.com
2. Download service account JSON
3. Add credentials to Notification Service `.env`

## Testing

### Test API Gateway

```powershell
curl http://localhost:3000/health
```

### Test Auth Service

```powershell
# Register
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@nsu.edu","phone":"01712345678","password":"password123","firstName":"Test","lastName":"User","role":"rider"}'

# Login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@nsu.edu","password":"password123"}'
```

## Monitoring

### View Service Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 ride-service
```

### Database Queries

```powershell
# PostgreSQL
docker exec -it ryden-postgres psql -U ryden -d ryden_db

# MongoDB
docker exec -it ryden-mongodb mongosh -u ryden -p ryden123

# Redis
docker exec -it ryden-redis redis-cli -a ryden123
```

## Troubleshooting

### Service won't start

```powershell
# Check logs
docker-compose logs auth-service

# Rebuild service
docker-compose up -d --build auth-service

# Remove and recreate
docker-compose rm -f auth-service
docker-compose up -d auth-service
```

### Database connection errors

```powershell
# Check if databases are running
docker-compose ps

# Restart databases
docker-compose restart postgres mongodb redis

# Reset databases (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

### Port already in use

```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

## Production Deployment

### AWS ECS/EKS

1. Build Docker images
2. Push to ECR
3. Deploy with Fargate or Kubernetes
4. Use RDS for PostgreSQL
5. Use DocumentDB for MongoDB
6. Use ElastiCache for Redis

### Environment Variables

Update production `.env` files with:
- Production database URLs
- Real payment gateway credentials
- Production Firebase keys
- Production Twilio credentials
- Strong JWT secrets

### Security Checklist

- [ ] Change default passwords
- [ ] Use HTTPS/TLS for all services
- [ ] Enable firewall rules
- [ ] Set up VPC and security groups
- [ ] Enable database backups
- [ ] Implement logging and monitoring
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Use environment secrets management
- [ ] Implement API versioning

## Support

For issues or questions:
- Backend Team: backend@ryden.bd
- Documentation: https://docs.ryden.bd
- GitHub Issues: https://github.com/0-Lucifer/ryden/issues

## License

Proprietary - NSU Ride-Sharing Platform
