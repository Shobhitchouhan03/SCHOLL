# Multi-Tenant School Management SaaS Platform

A production-ready full-stack SaaS application where one Super Admin can manage multiple schools dynamically from a single platform.

## Architecture

- **Shared Codebase & Single Database**: All school data is isolated via `schoolId` at the collection level.
- **Single Deployment & Branded Links**: One frontend deployment and one backend deployment serve all schools dynamically via branded URLs (e.g. `/s/school-slug/login`).
- **Student Data Access**: Student data is accessed securely through the **Parent Portal** (with Child Selector) and **Teacher/Principal Portals**. No separate Student login credentials exist to prevent credential overhead for young students.
- **Strict Multi-Tenant Middleware**: Tenant security is enforced on every request by deriving `schoolId` directly from the authenticated JWT session.
- **Manual Account Provisioning**: High-security account creation flow without self-registration or email activation. Accounts are active immediately, with raw credentials displayed ONCE in a secure copyable UI component and stored hashed using bcrypt.

## Technology Stack

- **Frontend**: React, Vite, JavaScript, Tailwind CSS (Custom Theme Palette), React Router, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB Atlas with Mongoose, JWT in HTTP-Only Cookie, Helmet security headers, Rate Limiter.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env to set your MONGODB_URI, JWT secrets, and Super Admin credentials
npm run dev
```

### 2. Seed Initial Super Admin
```bash
cd backend
npm run seed:superadmin
```
Super Admin credentials are derived strictly from your environment variables:
```json
{
  "loginId": "YOUR_SUPER_ADMIN_LOGIN_ID",
  "password": "YOUR_SUPER_ADMIN_PASSWORD"
}
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## User Roles & Dashboards

- **Super Admin** (`/super-admin/dashboard`): Platform statistics, School onboarding, Principal account setup, tenant activation toggling.
- **Principal** (`/principal/dashboard`): School Setup Wizard (`/principal/setup`), School statistics, Teacher & Parent onboarding, account status toggles, password resets.
- **Teacher** (`/teacher/dashboard`): Class overview and teaching tools.
- **Parent** (`/parent/dashboard`): Linked student tracking and school noticeboard.
