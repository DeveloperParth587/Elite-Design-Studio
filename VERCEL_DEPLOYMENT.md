# Vercel Deployment Guide

## Overview

This project has a **frontend + backend** architecture. Vercel excels at hosting the frontend, but the Express backend requires a separate deployment provider.

- **Frontend**: Deployed to Vercel ✓ (React + Vite)
- **Backend**: Deploy separately to Railway, Fly.io, or similar (Express.js)
- **Database**: Supabase (managed cloud service)

## Frontend Deployment to Vercel

### Prerequisites

1. **Vercel account** — Create at https://vercel.com
2. **GitHub/GitLab repo** — Push your code to git
3. **Clerk upgraded to Production** — Switch from development keys to production Clerk keys
4. **Environment variables** — Configure in Vercel dashboard

### Step 1: Prepare Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxx...  (from Clerk Dashboard)
VITE_CLERK_PROXY_URL=https://your-domain.clerk.accounts.dev
VITE_API_URL=https://your-backend-domain.com/api  (point to your backend)
```

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Select your Git repository
3. Framework: **Other** (or leave auto-detected)
4. Build Command: `pnpm --filter @workspace/elite-design-studio run build`
5. Output Directory: `artifacts/elite-design-studio/dist/public`
6. Install Command: `pnpm install`
7. Environment variables: Add the three vars above
8. Click **Deploy**

### Step 3: Deploy Backend Separately

**Option A: Railway.app (Recommended)**

1. Create Railway account: https://railway.app
2. Connect GitHub repo
3. Create new service → Select from Git repo
4. Set environment variables in Railway:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CLERK_SECRET_KEY`
   - `ADMIN_EMAILS`
   - `NODE_ENV=production`
5. Go to Settings → Domains, enable a public domain
6. Copy domain URL → Update `VITE_API_URL` in Vercel

**Option B: Fly.io**

1. Install `flyctl`: https://fly.io/docs/getting-started/installing-flyctl/
2. Create app: `fly apps create your-app-name`
3. Set secrets: `fly secrets set SUPABASE_URL=xxx SUPABASE_ANON_KEY=yyy ...`
4. Deploy: `fly deploy`
5. Get domain from `fly status` → Update `VITE_API_URL` in Vercel

## API Base URL

The frontend uses relative URLs (`/api/*`) which work on Replit. For Vercel:

- If backend is on same domain (via proxy): no change needed
- If backend is on separate domain: Update `VITE_API_URL` to point to your backend

The frontend uses `setBaseUrl()` from the API client to prefix all requests.

## Database Setup

Ensure your Supabase database tables exist. Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  budget TEXT,
  location TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  budget BIGINT,
  timeline INTEGER,
  property_type TEXT,
  classification TEXT,
  message TEXT,
  generated_email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE testimonials (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  role TEXT,
  content TEXT,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE design_shares (
  id BIGSERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Clerk Production Setup

1. Go to https://dashboard.clerk.com
2. Create a **Production instance** (not development)
3. In Clerk Dashboard → Settings → Domains:
   - Add your Vercel domain: `https://your-domain.vercel.app`
4. Copy the **Production Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY` in Vercel
5. Copy **Proxy URL** → `VITE_CLERK_PROXY_URL` in Vercel

## Troubleshooting

### "Development mode" badge still showing
- You're using development Clerk keys. Switch to production keys.

### Admin routes returning 401
- Ensure `ADMIN_EMAILS` environment variable is set in Vercel (comma-separated list)
- Ensure user's email matches the `ADMIN_EMAILS` list

### API calls failing
- Check `VITE_API_URL` is correctly set in Vercel
- Verify backend is running and accessible
- Check CORS configuration if frontend and backend are on different domains

### Build failing
- Ensure all dependencies are in `pnpm-workspace.yaml`
- Run `pnpm install` locally to verify it works
- Check Vercel build logs for specific errors

## Costs

- **Vercel**: Free tier covers most projects (up to 12 serverless function invocations/sec)
- **Railway**: ~$5–20/month for backend
- **Fly.io**: ~$5–25/month for backend
- **Supabase**: Free tier for development, pay-as-you-go for production

## Production Checklist

- [ ] Clerk upgraded to production keys
- [ ] Supabase database tables created
- [ ] Backend deployed to Railway/Fly.io/similar
- [ ] Environment variables set in Vercel
- [ ] `VITE_API_URL` points to deployed backend
- [ ] Admin emails configured
- [ ] Test sign-in with test account
- [ ] Test admin access with authorized email
- [ ] Verify public pages load (portfolio, home, testimonials)
