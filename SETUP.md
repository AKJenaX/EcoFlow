# EcoFlow Setup Guide

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **MySQL** 8+

---

## 1. Clone the Repository

```bash
git clone https://github.com/AKJenaX/EcoFlow.git
cd EcoFlow
```

---

## 2. Database Setup

### Create the database and tables

Run the migration SQL against your MySQL instance:

```bash
cd backend
npm run migrate
```

### Apply required schema changes

These ALTER statements add the authentication columns and make legacy columns nullable for registered users:

```sql
ALTER TABLE UserTable
  ADD COLUMN Username VARCHAR(255) UNIQUE,
  ADD COLUMN Password_Hash VARCHAR(255);

ALTER TABLE UserTable
  MODIFY COLUMN Mobile_Number VARCHAR(20) NULL;

ALTER TABLE UserTable
  DROP FOREIGN KEY usertable_ibfk_1,
  MODIFY COLUMN Vehicle_ID INT NULL;
```

### Seed RBAC roles and permissions

```bash
npm run seed:rbac
```

---

## 3. Backend Configuration

Create a `.env` file inside the `backend/` directory (use `.env.example` as reference):

```env
# MySQL connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_here

# OpenAI (required for AI Copilot feature)
OPENAI_API_KEY=sk-...

# Feature flags
ENABLE_IOT=true
ENABLE_OPTIMIZATION=true
ENABLE_COPILOT=true

# Dev auth bypass — set to true to skip DB auth check (development only)
ALLOW_DEV_AUTH_BYPASS=false
```

> **Dev tip:** Set `ALLOW_DEV_AUTH_BYPASS=true` during local development to log in with any username and the password `devpass` without a database lookup. Never enable this in production.

---

## 4. Frontend Configuration

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000
```

---

## 5. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## 6. Start the Project

Open two terminals:

**Terminal 1 — Backend (port 3000):**
```bash
cd backend
node server.js
# or for auto-reload during development:
npm run dev
```

**Terminal 2 — Frontend (port 3001):**
```bash
cd frontend
npm run dev
```

The app will be available at **http://127.0.0.1:3001**

---

## 7. Register and Log In

1. Open **http://127.0.0.1:3001/register**
2. Enter a **username**, **password** (min 6 characters), and confirm the password
3. Click **Create Account** — you will be redirected to the login page
4. Enter your username and password, click **Sign In**

---

## Security Notes

- Never commit `.env` files — they are already in `.gitignore`
- `ALLOW_DEV_AUTH_BYPASS` must be `false` (or absent) in any production deployment
- The OpenAI API key is only required if using the AI Copilot feature
