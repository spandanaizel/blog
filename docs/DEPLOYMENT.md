# Deployment

This app splits cleanly into three independently-deployable pieces: the MongoDB database, the
Express API, and the static React build. Pick one database provider and one host per app piece.

## 1. Database - MongoDB Atlas

1. Create a free cluster at mongodb.com/cloud/atlas.
2. Database Access - add a user with a strong password.
3. Network Access - add 0.0.0.0/0 (or your specific hosting provider's egress IPs, if known)
   so the API host can reach it.
4. Get the connection string (Drivers - Node.js). It looks like
   mongodb+srv://user:password@cluster.mongodb.net/blog-platform?retryWrites=true&w=majority
   This becomes MONGO_URI.

## 2. Backend - Render or Railway

Both work the same way for this repo: point them at backend/ as the root, with:

- Build command: npm install && npm run build
- Start command: npm start (runs node dist/server.js)
- Health check path: /api/health

### Render
1. New - Web Service - connect the repo, set Root Directory to backend.
2. Set the build/start commands above.
3. Add environment variables (see the table below).
4. Render auto-detects the port from process.env.PORT - make sure PORT is set to whatever Render
   injects (it sets this automatically; don't hardcode 5000 in production).
5. Health check path: /api/health.

### Railway
1. New Project - Deploy from GitHub repo - set the service root to backend.
2. Railway auto-detects Node; confirm build/start commands match the above.
3. Add environment variables.
4. Railway also injects PORT automatically.

### Environment variables (backend)

| Variable | Required | Notes |
|---|---|---|
| NODE_ENV | yes | production |
| PORT | yes | injected by the host, or 5000 locally |
| CLIENT_URL | yes | the deployed frontend's origin - used for CORS and the refresh cookie |
| MONGO_URI | yes | from Atlas |
| JWT_ACCESS_SECRET | yes | long random string |
| JWT_REFRESH_SECRET | yes | a different long random string |
| JWT_ACCESS_EXPIRES_IN | no | default 15m |
| JWT_REFRESH_EXPIRES_IN | no | default 7d |
| CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET | no | image uploads fall back gracefully if omitted (see ARCHITECTURE.md) |
| RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX | no | defaults 900000 / 300 |

Generate strong secrets with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

## 3. Frontend - Vercel

1. Import the repo into Vercel, set Root Directory to frontend.
2. Framework preset: Vite. Build command: npm run build. Output directory: dist.
3. Environment variables:

| Variable | Value |
|---|---|
| VITE_API_URL | https://your-backend-host/api |
| VITE_SOCKET_URL | https://your-backend-host |

4. Deploy. Vercel handles SPA fallback routing automatically for Vite projects.

Render and Railway can also serve the frontend as a static site if you'd rather keep everything on
one provider - same build command/output directory, just without the Vite-specific presets.

## CORS

The backend's CORS config (backend/src/app.ts) allows exactly one origin: env.CLIENT_URL, with
credentials enabled (required for the httpOnly refresh cookie). Set CLIENT_URL to your deployed
frontend's exact origin (including https://, no trailing slash) or the refresh flow will fail with
a CORS error.

## Health checks

GET /api/health returns 200 without touching the database, so it's safe to use as a liveness probe
on any platform (Render, Railway, Kubernetes, etc.) - it won't report unhealthy just because Mongo
is briefly unreachable, which is usually the right behavior for a liveness (vs. readiness) check.

## Production logging

The backend uses Winston (backend/src/utils/logger.ts), logging to stdout/stderr in plain text. On
Render/Railway this is captured automatically by the platform's log viewer - no extra configuration
needed. For higher log volume, point Winston at a transport for your log aggregator of choice
(Datadog, Logtail, etc.) by extending logger.ts.

## Docker (self-hosted / any VM)

See the root docker-compose.yml. On a VM with Docker installed:

```
git clone <repo>
cd blog-platform
cp .env.example .env
docker compose up -d --build
```

Fill in real secrets in .env before starting. Put a reverse proxy (Caddy, nginx, or the platform's
built-in load balancer) in front for TLS.

## Production checklist

- JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are long, random, and different from each other
- CLIENT_URL matches the deployed frontend's exact origin
- MongoDB Atlas network access is locked down as tightly as your host allows
- Cloudinary keys are set (or you've accepted the data-URI fallback for images)
- NODE_ENV=production on the backend (disables verbose dev logging, tightens cookie flags)
- Health check configured against /api/health on whichever host runs the backend
- Rate limiting values reviewed for expected traffic
- A real transactional email provider is wired into forgotPassword before launch - right now it
  only returns the raw reset token in the API response when NODE_ENV=development
