# Production Deployment Checklist

## Before Deploying

### Database
- [ ] Supabase tables created (projects, leads, testimonials, design_shares)
- [ ] Row-level security policies configured (if needed)
- [ ] Backups enabled in Supabase

### Authentication (Clerk)
- [ ] Switch from development keys to production keys
- [ ] Add your domain to Clerk allowed origins
- [ ] Configure email providers (if using custom domain)
- [ ] Test OAuth providers (Google, etc.)

### API Server
- [ ] Deploy backend to Railway/Fly.io/similar
- [ ] Set environment variables on backend:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `CLERK_SECRET_KEY`
  - `ADMIN_EMAILS` (comma-separated)
  - `NODE_ENV=production`
- [ ] Test API endpoints from production domain
- [ ] Enable CORS for your Vercel domain

### Frontend (Vercel)
- [ ] Create Vercel account and link GitHub repo
- [ ] Set environment variables in Vercel:
  - `VITE_CLERK_PUBLISHABLE_KEY` (production)
  - `VITE_CLERK_PROXY_URL` (production domain)
  - `VITE_API_URL` (backend domain + /api)
- [ ] Verify build succeeds locally: `pnpm --filter @workspace/elite-design-studio run build`
- [ ] Test build output: `pnpm --filter @workspace/elite-design-studio run serve`

### Security
- [ ] All environment variables are secrets (not in code)
- [ ] Sensitive keys are in Vercel/Railway secrets, not committed to git
- [ ] ADMIN_EMAILS correctly configured (only intended admins)
- [ ] Clerk webhook endpoints configured (optional, for advanced features)
- [ ] HTTPS enabled (automatic on Vercel)

### Testing
- [ ] Test user sign-up flow
- [ ] Test admin access (authorized and unauthorized accounts)
- [ ] Test portfolio pages load correctly
- [ ] Test lead submission form
- [ ] Test Supabase connection (verify tables are being written to)
- [ ] Test image loading (Unsplash fallbacks work)

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Vercel analytics
- [ ] Set up alerts for backend downtime
- [ ] Review Supabase usage metrics

### Domain & DNS
- [ ] Custom domain purchased (if not using vercel.app subdomain)
- [ ] DNS configured for Vercel
- [ ] SSL certificate provisioned (automatic)
- [ ] Email configured (if needed for notifications)

### Documentation
- [ ] README updated with production domain
- [ ] Environment variables documented for team members
- [ ] Deployment procedures documented
- [ ] Team access to Vercel, Railway, Supabase configured

## After Deployment

- [ ] Test all critical user flows
- [ ] Verify analytics/monitoring working
- [ ] Backup Supabase data
- [ ] Set up automated backup strategy
- [ ] Configure monitoring alerts
- [ ] Document any issues and solutions
- [ ] Plan maintenance windows (if needed)

## Rollback Plan

- [ ] Keep previous Vercel deployment available for quick rollback
- [ ] Document backend rollback procedure
- [ ] Test rollback process before going live
