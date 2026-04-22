# Valora Bank

Valora Bank is a full-stack banking management system with:
- A Node.js + Express REST API backend
- A React + Vite frontend
- A MySQL (InnoDB) relational schema

It supports role-based workflows for Admin, Employee, and Customer users, including account management, transactions, transfers, loans, KYC, support tickets, notifications, and audit logs.

## Tech Stack

### Backend
- Node.js
- Express
- MySQL (`mysql2/promise`)
- JWT authentication
- `express-validator` validation
- Security middleware (`helmet`, CORS, rate limiting)
- Jest + Supertest for tests

### Frontend
- React
- Vite
- React Router
- Axios
- Bootstrap

### Database
- MySQL (InnoDB)

## Project Structure

- `backend/` - API server, services, routes, controllers, tests
- `frontend/` - React application
- `Valora Bank - MySQL Schema (InnoDB).sql` - schema + indexes + role seed

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

## 1) Database Setup

Create and use a database (example name below uses `valora_bank`):

```sql
CREATE DATABASE valora_bank;
USE valora_bank;
```

Load schema:

```bash
mysql -u root -p valora_bank < "Valora Bank - MySQL Schema (InnoDB).sql"
```

Load seed data (optional, recommended for local testing):

```bash
mysql -u root -p valora_bank < backend/seed.sql
```

## 2) Backend Setup

From the `backend` directory:

```bash
cd backend
npm install
```

Create `.env` in `backend/` with:

```env
# App
NODE_ENV=development
PORT=3000
TRUST_PROXY=0
LOG_LEVEL=debug

# Auth
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1h

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=valora_bank
DB_POOL_SIZE=10
DB_TX_ISOLATION=READ COMMITTED

# CORS
CORS_ORIGINS=http://localhost:5173
CORS_CREDENTIALS=true

# Rate limit
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
RATE_LIMIT_AUTH_MAX=200
```

Start backend:

```bash
npm run dev
```

API health endpoint:

- `GET http://localhost:3000/health`

## 3) Frontend Setup

From the `frontend` directory:

```bash
cd ../frontend
npm install
```

Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start frontend:

```bash
npm run dev
```

Open the Vite URL shown in terminal (usually `http://localhost:5173`).

## Backend Scripts

From `backend/`:

- `npm run dev` - run with nodemon
- `npm start` - run with node
- `npm test` - run Jest tests

## Frontend Scripts

From `frontend/`:

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - lint source

## API Overview

All protected routes are under `/api` and require a Bearer token unless stated otherwise.

### Public/less restricted
- `/health`
- `/api/auth/register`
- `/api/auth/login`

### Main route groups
- `/api/auth` - auth/profile/password/PIN
- `/api/accounts` - account create/list/freeze/close
- `/api/transactions` - deposit/withdraw/history
- `/api/transfers` - account-to-account transfers
- `/api/loans` - apply, decision, payments, listing
- `/api/kyc` - submit, verify, list
- `/api/support` - ticket create/assign/status/list
- `/api/notifications` - list and mark read
- `/api/account-requests` - account request workflow + branch list
- `/api/admin` - admin management/reporting/stats endpoints
- `/api/employee` - employee dashboard, branch users, loan and ticket operations

## Default Seed Credentials

When `backend/seed.sql` is imported:

- Admin: `admin@valora.com`
- Employee: `employee@valora.com`
- Customer: `customer@valora.com`
- Password for seeded users: `Test@1234`

## Quick API Smoke Test (curl)

After starting backend (`npm run dev` in `backend/`), run:

```bash
# 1) Health check
curl http://localhost:3000/health

# 2) Login as admin and copy the token from response
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@valora.com","password":"Test@1234"}'
```

Set your token in shell (replace `<TOKEN_FROM_LOGIN_RESPONSE>`):

```bash
TOKEN="<TOKEN_FROM_LOGIN_RESPONSE>"
```

Test protected endpoints:

```bash
# 3) Current authenticated user
curl http://localhost:3000/api/auth/me \
	-H "Authorization: Bearer $TOKEN"

# 4) List accounts (first page)
curl "http://localhost:3000/api/accounts?page=1&page_size=10" \
	-H "Authorization: Bearer $TOKEN"

# 5) List notifications
curl "http://localhost:3000/api/notifications?page=1&page_size=10" \
	-H "Authorization: Bearer $TOKEN"
```

Optional customer transfer test:

```bash
# Login as customer
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"customer@valora.com","password":"Test@1234"}'

# Then use that token and perform a transfer
curl -X POST http://localhost:3000/api/transfers \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $TOKEN" \
	-d '{"from_account_id":1,"to_account_number":"100000000002","amount":500}'
```

## Notes

- `JWT_SECRET` is required; backend startup fails without it.
- In development, CORS defaults to `http://localhost:5173` if not overridden.
- Update database and CORS values for production deployment.
