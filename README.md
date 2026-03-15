# QuickHire — Backend

> REST API server for QuickHire — Online job finding platform. Built with Node.js, Express, PostgreSQL, and Prisma ORM.

---

## 📌 Project Overview

**QuickHire Backend** is a RESTful API server that powers the QuickHire job portal. It handles all business logic including job management, applications, admin authentication, and role-based access control.

The server is built with **Node.js + Express** and uses **PostgreSQL** as the database with **Prisma ORM** for type-safe database queries.

Two roles exist in the system:
- **Admin** — Can post, edit, delete, and feature jobs. Can view all applications
- **User/Applicant** — Can browse jobs and submit applications

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Access token stored in HTTP-only cookie
- Protected routes via middleware

### 👥 Role-Based Access Control
- **Admin** — Full access to job and application management
- **User** — Read-only access to jobs, can submit applications
- Middleware checks role before every protected request

### 💼 Job Management (Admin)
- Create a new job listing
- Edit existing job details
- Delete a job listing
- Feature / unfeature a job (shows on homepage)

### 📋 Applications
- Users can apply to jobs
- Admin can view all applications per job

### 🏠 Home Data
- Featured jobs endpoint
- New/latest jobs endpoint
- Job count grouped by category

### 💼 Jobs
- Get all jobs with filters (category, type, experience, salary)
- Get single job details
- Get companies list

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express.js](https://expressjs.com/) | Web framework |
| [PostgreSQL](https://www.postgresql.org/) | Database |
| [Prisma ORM](https://www.prisma.io/) | Type-safe database client |
| [JWT](https://jwt.io/) | Authentication tokens |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser) | Cookie handling |
| [cors](https://www.npmjs.com/package/cors) | Cross-origin requests |
| [express-validator](https://express-validator.github.io/) | Request validation (per module) |

---

## 📁 Project Structure

```
quickhire-backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Prisma migrations
├── src/
│   ├── middlewares/
│   │   ├── auth.ts  # Verify JWT token and request pemission
│   │   └── .........Other middlewares
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
|   |   |   └── auth.validate.ts
│   │   ├── job/
│   │   │   ├── job.route.ts
│   │   │   ├── job.controller.ts
│   │   │   ├── job.service.ts
|   |   |   └── job.validate.ts
│   │   ├── application/
│   │   │   ├── application.route.ts
│   │   │   ├── application.controller.ts
│   │   │   └── application.service.ts
|   |   |   └── application.validate.ts
│   │   └── company/
│   │       ├── company.route.ts
│   │       ├── company.controller.ts
│   │       └── company.service.ts
│   ├── routes/
│   │   └── index.ts            # Root router — mounts
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Hriday-paul/QBackend.git
cd QBackend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
.env #create a .env file to root
```

Then fill in the values (see [Environment Variables](#-environment-variables) below).

### 4. Setup Database

```bash
# Generate prisma
npx prisma generate

# Run Prisma migrations
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
```

Server starts at [http://localhost:5100](http://localhost:5100)

---

## 🔐 Environment Variables

Create a `.env` file in the root of the project:

```dotenv
# -----------------------------------------------
# Server
# -----------------------------------------------

# Environment — "development" or "production"
NODE_ENV=development

# Port the server runs on
PORT=5100

# Server local IP address
IP=10.10.10.9

# Base URL of the server
BASE_URL=http://localhost:5100

# Full API base URL
SERVER_URL=http://localhost:5100/api


# -----------------------------------------------
# Database
# -----------------------------------------------

# PostgreSQL connection string

# DATABASE_URL="postgresql://neondb_owner:npg_vk81hODrfRqy@ep-broad-scene-aminy8of-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"


# -----------------------------------------------
# Auth / JWT
# -----------------------------------------------

# Password hashing rounds (higher = slower but more secure, recommended: 10-12)
BCRYPT_SALT_ROUNDS=12

# Extra secret added to password before hashing (pepper)
PASSWORD_PEPPER=your_password_pepper_here

# Access token secret (use a long random string)
JWT_ACCESS_SECRET=your_jwt_access_secret_here

# Refresh token secret (use a long random string)
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Access token expiry
JWT_ACCESS_EXPIRES_IN=1d

# Refresh token expiry
JWT_REFRESH_EXPIRES_IN=7d


# -----------------------------------------------
# CORS
# -----------------------------------------------

# Frontend URL (allowed origin)
CLIENT_URL=http://localhost:3000


# -----------------------------------------------
# Email (Nodemailer)
# -----------------------------------------------

# Current email environment — "development" or "production"
EMAIL_ENV=development

# SMTP email address
NODEMAILER_HOST_EMAIL=your_email@gmail.com

# SMTP app password (not your regular Gmail password)
NODEMAILER_HOST_PASS=your_app_password_here
```

---

## 📜 Available Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to JavaScript
npm run start      # Start production server
npm run lint       # Run ESLint
npx prisma studio  # Open Prisma Studio (visual DB browser)
npx prisma migrate dev   # Run new migrations
npx prisma generate      # Regenerate Prisma client
```