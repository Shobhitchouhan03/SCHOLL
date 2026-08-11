# Deployment Guide

This document details production deployment steps and architecture for the Multi-Tenant School Management SaaS platform.

## Live Deployment Architecture

The SaaS application utilizes a single, scalable deployment model for all schools:

- **One Frontend Deployment** (e.g., `https://yourdomain.com`)
- **One Backend Deployment** (e.g., `https://api.yourdomain.com`)
- **One MongoDB Atlas Database**
- **Multiple Schools** separated logically by `schoolId` multi-tenant isolation.

### Custom Domain & Subdomain Tenant Resolution

Each school can be accessed via 3 dynamic entry points without code deployments:
1. **URL Slug Route**: `https://yourdomain.com/s/little-stars`
2. **Platform Subdomain**: `https://little-stars.yourdomain.com`
3. **Custom FQDN Domain**: `https://littlestarsschool.com`

#### DNS Setup for School Custom Domains:
School domain administrators should configure DNS records:
- **CNAME Record**: `CNAME @ -> yourdomain.com` or `CNAME www -> yourdomain.com`
- **A Record**: Point `@` to the SaaS platform static load balancer IP address.

> [!NOTE]
> Adding new schools or custom domains requires **zero code changes or new deployments**. The application's `resolveTenantFromRequest(req)` service dynamically resolves tenant branding and data from the request hostname.

## Production Environment Variables

### Backend (`backend/.env`)
Ensure all placeholders in `.env.example` are configured in production:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/school_saas_db
JWT_ACCESS_SECRET=your_ultra_secure_jwt_secret_key_32_chars
JWT_REFRESH_SECRET=your_ultra_secure_jwt_refresh_key_32_chars
CLIENT_URL=https://your-frontend-domain.com
COOKIE_DOMAIN=your-domain.com
ROOT_DOMAIN=yourdomain.com
PUBLIC_APP_URL=https://yourdomain.com
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

## Backend Deployment (e.g. Render, Railway, AWS App Runner)

1. Connect Git repository.
2. Set root directory to `backend/`.
3. Build & start commands:
   - Build: `npm install`
   - Start: `node src/server.js`
4. Set Environment Variables in provider dashboard.

## Frontend Deployment (e.g. Vercel, Netlify, Cloudflare Pages)

1. Connect Git repository.
2. Set root directory to `frontend/`.
3. Configuration:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Enable Single Page Application (SPA) rewrite rule to redirect all routes to `index.html`.

## Security Checklists

- [x] CORS restricted to `CLIENT_URL`.
- [x] Passwords stored only as bcrypt hashes.
- [x] JWT stored in HTTP-Only, Secure, SameSite cookies.
- [x] Helmet headers active.
- [x] Rate limiting active on authentication endpoints.
- [x] `schoolId` derived strictly from authenticated user.
