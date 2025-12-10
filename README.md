# Ryden — Campus Ridesharing App

This repository contains the Ryden mobile app (built with Expo / React Native) and the backend microservices powering authentication, chat, rides, payments, and more.

> Note: This repository includes both frontend and backend code. Some services may require environment variables (e.g., Firebase credentials); see the Configuration section below.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Local Development (Frontend)](#local-development-frontend)
- [Local Development (Backend)](#local-development-backend)
- [Database and Migrations](#database-and-migrations)
- [Environment & Configuration](#environment--configuration)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security & Secrets](#security--secrets)
- [License & Contributing](#license--contributing)

---

## Project Overview
Ryden is a campus ridesharing application with mobile and web clients built in Expo (React Native), and a Node.js microservices backend (Express) using PostgreSQL. Authentication is Firebase-first and the backend verifies Firebase tokens and manages user profiles, rides, payments, and other services.

This README will help you get the project running locally and explain common workflows.

---

## Repository Structure
Top-level folders include:

- `app/` — Frontend Expo app with screens and components.
- `backend/` — API microservices, one service per folder under `backend/services/`.
- `components/`, `context/`, `services/` — Frontend helpers and utilities.
- `config/` — Local config files (e.g., `api.config.ts`, `firebase.ts`) — do not commit secrets.
- `backend/database/migrations/` — SQL migrations for the database.

---

## Local Development (Frontend)
Prerequisites:

- Node.js 18+ (or compatible LTS)
- npm or yarn
- Expo CLI: `npm install -g expo-cli` (optional; `npx expo` works)

Install dependencies and run the app:

```powershell
cd c:\Users\user\ryden
npm install
npx expo start
```

Open the project in Expo Go (iOS/Android) or a web browser.

Running in development mode: edit files in `app/` and the Expo dev server will hot-reload updates.

---

## Local Development (Backend)
The backend runs as microservices in the `backend/services/` subfolders. We provide a Docker Compose setup for convenience.

Prerequisites:
- Docker & Docker Compose
- PostgreSQL or use the containerized image from the Compose config

Start services with Docker Compose (from the `backend` folder):

```powershell
cd c:\Users\user\ryden\backend
docker-compose up --build
```

This will bring up the gateway and all services defined in `backend/docker-compose.yml`. Services talk to PostgreSQL and include auth, chat, notification, ride, payment, rating, user, and more.

If you prefer to run services locally without Docker, consult each service's `package.json` and start scripts.

---

## Database & Migrations
Migrations are in `backend/database/migrations/`. Use the project's recommended tooling for applying migrations to your PostgreSQL instance (e.g., psql, node migration scripts, or a migration tool such as `db-migrate` if included).

Example using psql (local dev):

```powershell
psql -U <dbuser> -h <host> -d <db> -f backend/database/migrations/001_init_schema.sql
psql -U <dbuser> -h <host> -d <db> -f backend/database/migrations/002_add_firebase_uid.sql
psql -U <dbuser> -h <host> -d <db> -f backend/database/migrations/003_add_provider_column.sql
```

> Note: Be careful running migrations against a production DB.

---

## Environment & Configuration
Most services need environment variables. DO NOT commit secrets (`.env` files, Firebase service accounts, or tokens).

Key environment variables include (non-exhaustive):

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK credentials for the backend.
- `FIREBASE_API_KEY`, and Firebase client configuration for the frontend (used for sign-in flows).
- `DATABASE_URL`, `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGDATABASE`, `PGPORT` — Postgres connection details.
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN` — for backend JWT tokens.
- `API_BASE_URL` — frontend API endpoint.

Add a local `.env` for your environment or rely on Docker Compose's environment configuration.

Security tip: Create a `config/firebase.example.ts` or `config/firebase.example.json` with placeholders rather than committing real credentials.

---

## Scripts
Key npm scripts for the root repo (see `package.json`):

- `npm run reset-project` — Reset to starter template, moves code to `app-example`.
- `npx expo start` — Start Expo dev server (frontend).
- Backend services have their own `package.json` files with `start`, `dev`, and `test` scripts.

---

## Testing
Backend services contain tests under `backend/services/*/__tests__/`. Use the Node test runner (nyc/jest/mocha) as configured in each service.

Example:

```powershell
cd backend/services/auth
npm install
npm test
```

---

## Deployment
Deployment depends on your infrastructure (Docker Compose, container registry, Kubernetes, etc.). The repository includes a gateway service and a Docker Compose file for local orchestration.

Shared production keys and secrets must not be stored in the repo. Use secret management or environment variables.

---

## Security & Secrets
- Never commit `.env` files or credential files. They should be in `.gitignore` and kept out of the repo.
- Revoke any leaked keys and rotate secrets if they are accidentally committed. We recommend rotating Firebase service account keys if they become exposed.

---

## License & Contributing
If you want to open-source any portion or allow collaborators, add a `LICENSE` and contributing guidelines. For this private repo, standard internal policies should apply.

Contribution process:
1. Create a new branch (e.g., `feat/your-change`)
2. Commit changes with a clear message
3. Create a PR targeting `main` and request a review

---

## Troubleshooting
- If the frontend can't reach the backend, ensure `API_BASE_URL` is set correctly and CORS is configured for the gateway.
- `500` server errors: check individual service logs for stack traces (e.g., `docker logs <service>`).
- Database errors: confirm migrations are applied and that the database URL is correct.

---

If you want, I can now:
- Add a sample `config/firebase.example.ts` file (non-secret) to the repo; or
- Update `.gitignore` to ignore `config/firebase.ts` and other dev artifacts; or
- Remove specific tracked dev/sensitive files from the repository and preserve only the current codebase.

Which of these would you like me to do next?
