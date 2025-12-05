# Ryden Project - Complete Setup Guide

## 📋 Prerequisites

### Required Software
- **Node.js** (v16+) - ✓ Already installed
- **npm** (v8+) - ✓ Already installed  
- **Docker Desktop** - ⚠️ Needs installation
- **Git** - For version control

### System Requirements
- Windows 11 Home (your system) ✓
- 4GB RAM minimum (8GB+ recommended)
- 20GB free disk space

---

## 🐳 Install Docker Desktop

### Step 1: Download Docker
1. Visit: https://www.docker.com/products/docker-desktop
2. Click **"Download for Windows"**
3. Choose the appropriate version:
   - **Docker Desktop for Windows (Intel chip)** - For most systems
   - **Docker Desktop for Windows (Apple Silicon)** - For M1/M2 Macs (not applicable to you)

### Step 2: Run Installer
1. Open Downloads folder
2. Double-click **Docker Desktop Installer.exe**
3. Follow the installation wizard:
   - Accept the license agreement
   - Keep default installation path
   - ✓ Check "Use WSL 2 instead of Hyper-V"
   - ✓ Check "Add Docker to PATH"

### Step 3: Complete Installation
1. Click **Install** and wait for completion
2. **Restart your computer** when prompted
3. After restart, Docker will start automatically

### Step 4: Verify Installation
Open PowerShell and run:
```powershell
docker --version
docker run hello-world
```

You should see Docker version and a "Hello from Docker!" message.

---

## 🚀 Running the Project

### Option 1: Full Stack (Frontend + Backend) - RECOMMENDED

**Requirements:** Docker Desktop must be installed and running

Run this command:
```powershell
cd c:\Users\user\ryden
.\setup-and-run.ps1
```

This will:
1. ✓ Verify Docker installation
2. ✓ Start all backend services (PostgreSQL, MongoDB, Redis, Microservices)
3. ✓ Initialize the Expo development server
4. ✓ Display options for running on web, Android, or iOS

### Option 2: Frontend Only (Development/Testing)

**No Docker required** - Uses mock data for development

Run this command:
```powershell
cd c:\Users\user\ryden
.\run-frontend-only.ps1
```

Or manually:
```powershell
cd c:\Users\user\ryden
npm start
```

---

## 📱 Accessing the Application

### Web Browser
After `npm start`, press **'w'** to open the web version at:
- http://localhost:8081

### Android Emulator
Press **'a'** to launch Android emulator (requires Android Studio)

### iOS Simulator
Press **'i'** to launch iOS simulator (requires Xcode on macOS only)

### Expo Go App
Scan the QR code in terminal with the **Expo Go** mobile app

---

## 🔌 Backend Services (When Running Full Stack)

After Docker services start, they'll be available at:

| Service | Port | URL |
|---------|------|-----|
| **API Gateway** | 3000 | http://localhost:3000 |
| **Auth Service** | 3001 | http://localhost:3001 |
| **User Service** | 3002 | http://localhost:3002 |
| **Ride Service** | 3003 | http://localhost:3003 |
| **Location Service** | 3004 | http://localhost:3004 |
| **Payment Service** | 3005 | http://localhost:3005 |
| **Notification Service** | 3006 | http://localhost:3006 |
| **Chat Service** | 3007 | http://localhost:3007 |
| **Rating Service** | 3008 | http://localhost:3008 |
| **PostgreSQL** | 5432 | `postgresql://localhost:5432/ryden_db` |
| **MongoDB** | 27017 | `mongodb://localhost:27017` |
| **Redis** | 6379 | `redis://localhost:6379` |

### Database Credentials (Development)
```
PostgreSQL:
  User: ryden
  Password: ryden123
  Database: ryden_db

MongoDB:
  User: ryden
  Password: ryden123
  Database: ryden_chat

Redis:
  Password: ryden123
```

---

## 🛠️ Useful Commands

### Docker Commands
```powershell
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart <service-name>

# View service status
docker-compose ps
```

### Frontend Commands
```powershell
# Start development server
npm start

# Run linter
npm run lint

# Lint check for the project
npx expo lint

# Reset project to default
npm run reset-project
```

### Useful Ports During Development
- **8081**: Expo web server (auto-starts on `npm start`)
- **3000**: API Gateway
- **5432**: PostgreSQL
- **6379**: Redis
- **27017**: MongoDB

---

## 📁 Project Structure

```
c:\Users\user\ryden\
├── app/                          # React Native frontend (Expo Router)
│   ├── offer-ride.tsx           # Current file
│   ├── find-ride.tsx
│   ├── login.tsx
│   └── (tabs)/                  # Tab navigation
├── backend/                      # Microservices
│   ├── gateway/                 # API Gateway (Port 3000)
│   ├── services/
│   │   ├── auth/               # Auth Service (Port 3001)
│   │   ├── user/               # User Service (Port 3002)
│   │   ├── ride/               # Ride Service (Port 3003)
│   │   ├── location/           # Location Service (Port 3004)
│   │   ├── payment/            # Payment Service (Port 3005)
│   │   ├── notification/       # Notification Service (Port 3006)
│   │   ├── chat/               # Chat Service (Port 3007)
│   │   └── rating/             # Rating Service (Port 3008)
│   ├── shared/                 # Shared utilities & DB config
│   └── docker-compose.yml      # Docker services configuration
├── package.json                 # Frontend dependencies
└── setup-and-run.ps1           # Full stack startup script
```

---

## ⚠️ Common Issues & Solutions

### Docker won't start
- **Solution**: Ensure Hyper-V is enabled in Windows or use WSL 2 mode
- Check: Settings → Apps → Programs and Features → Turn Windows features on or off

### Port already in use
- **Solution**: Change port or stop the conflicting service
  ```powershell
  # Find process using port 3000
  netstat -ano | findstr :3000
  
  # Kill the process (replace PID)
  taskkill /PID <PID> /F
  ```

### npm install fails
- **Solution**: Clear npm cache
  ```powershell
  npm cache clean --force
  npm install
  ```

### Expo can't connect
- **Solution**: Ensure firewall allows Node.js
- Or restart Expo: Press 'r' in terminal

### Backend services won't start
- **Solution**: Check Docker is running
  ```powershell
  docker ps
  ```
- If error, restart Docker Desktop

---

## 🎯 Next Steps After Setup

1. **Verify Frontend**: Open http://localhost:8081 in browser
2. **Check Backend**: Visit http://localhost:3000 in browser
3. **Test API**: Use Postman or curl to test endpoints
4. **Review Code**: Check app/ and backend/services/ directories
5. **Start Development**: Edit files in app/ directory

---

## 📞 Support & Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Node.js Docs**: https://nodejs.org/docs
- **Docker Docs**: https://docs.docker.com

---

## 📝 Notes

- All frontend code changes are hot-reloaded (save file and see changes immediately)
- Backend services require Docker and docker-compose
- For production deployment, see BACKEND.md for additional setup
- Database migrations run automatically on first docker-compose up

---

**Last Updated:** December 4, 2025
**Project:** Ryden Campus Ride Sharing Platform
**Tech Stack:** React Native + Expo + Node.js Microservices + Docker
