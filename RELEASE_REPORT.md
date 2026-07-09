# Inkwell — Release Report

**Version:** v1.0.0
**Date:** 2026-06-24
**Status:** Production-ready release candidate

---

## Project name

**Inkwell** — Read. Write. Connect.

A full-stack blogging platform with a rich-text editor, real-time notifications, social features,
analytics dashboards, and an admin panel.

---

## Technology stack

| Layer | Technology |
|---|---|
| Frontend runtime | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS, Radix UI primitives (shadcn-style) |
| State | Zustand (auth, notifications, UI theme) |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Editor | TipTap 2 (StarterKit, Table, Image, Link, Underline, Placeholder) |
| Charts | Recharts |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Virtualization | react-window |
| Real-time | Socket.IO client |
| Backend runtime | Node.js 20, Express, TypeScript |
| Database | MongoDB 7 via Mongoose |
| Auth | JWT (access + refresh), bcrypt |
| Media | Cloudinary (graceful local fallback) |
| Validation | Zod |
| Logging | Winston |
| Testing (backend) | Jest, Supertest |
| Testing (frontend) | Vitest, React Testing Library |
| Containerization | Docker (multi-stage), Docker Compose, nginx |

---

## Feature inventory

### Authentication
- Register / login / logout
- JWT access tokens (15 min) + httpOnly refresh tokens (7 day) with rotation
- Forgot password / reset password
- Role-based access: `user` and `admin`
- Admin role promote/demote with self-demotion prevention

### Authoring
- TipTap rich-text editor: headings, lists, code blocks, tables, links, inline images
- Cloudinary-backed cover image, avatar, and inline image uploads with progress indicators
- Graceful local fallback when Cloudinary credentials are absent
- Draft / publish workflow
- Debounced local autosave
- Live preview mode
- Auto-generated slugs (de-duplicated), excerpts, and read-time estimates

### Discovery
- Home feed (trending + latest posts)
- Full-text search
- Filter by category, tag, author
- Sort: newest, oldest, popular, most-liked
- Curated tag and category browsing
- Paginated author directory with search

### Engagement
- Post likes with optimistic UI and rollback
- Nested threaded comments with edit and delete
- Comment likes
- Bookmarks
- Follow / unfollow
- Table of contents on long posts (IntersectionObserver-driven)
- Share buttons (Twitter, LinkedIn, copy-link)

### Social
- Author profiles with bio, social links, followers/following, published posts
- Followers and following list pages with follow/unfollow
- Real-time notifications: likes, comments, replies, follows, new posts, role changes
- Unread badge with per-notification and mark-all-read
- Unified activity feed (authored events + received events) with infinite scroll

### Dashboard
- Analytics overview: views/likes/comments/bookmarks/followers trends (Mongo aggregation)
- Category distribution pie chart, monthly post activity bar chart
- Top 5 posts by views
- Drafts management (edit, publish, delete)
- Bookmarks page
- Notifications page (virtualized)
- Profile editing: avatar upload, bio, social links
- Password change
- Dark mode toggle

### Admin panel
- Platform-wide analytics: all of the above plus top authors
- Post moderation: view and remove any post
- User directory: search, view roles, promote/demote with confirmation dialog

### Engineering
- Route-level code splitting: React.lazy + Suspense, every page lazy-loaded
- Vendor chunk splitting: TipTap, Recharts, Socket.IO, Radix, React, etc. in separate chunks
- Three-tier error boundaries: GlobalErrorBoundary, PageErrorBoundary, AsyncErrorBoundary
- React Query caching: staleTime (30s), gcTime (5 min), hover-prefetching, optimistic updates
- Virtualized lists: Notifications and Activity Feed via react-window
- React.memo on PostCard, AuthorListCard, CommentItem
- JWT refresh token rotation on every use
- Startup environment validation (refuses to start in production with insecure defaults)
- Helmet, rate limiting, Mongo sanitization, request size limits, Multer MIME + size validation
- Winston logging: auth events, admin actions, uploads, errors
- /health (liveness) and /ready (readiness + DB state) endpoints
- Docker: multi-stage builds, nginx for SPA, Compose with MongoDB service and health checks
- Deployment configs for Render (render.yaml), Railway (railway.json), and Vercel (vercel.json)

---

## API inventory

42 REST endpoints across 11 route modules:

| Module | Endpoints |
|---|---|
| `/api/auth` | 7 (register, login, logout, refresh, me, forgot-password, reset-password) |
| `/api/posts` | 7 (list, detail, create, update, delete, like, unlike) |
| `/api/comments` | 5 (create, list, update, delete, like) |
| `/api/bookmarks` | 3 (list, add, remove) |
| `/api/follow` | 2 (follow, unfollow) |
| `/api/users` | 8 (directory, by-username, me, update-profile, change-password, posts, followers, following) |
| `/api/analytics` | 3 (dashboard, admin, user/:id) |
| `/api/notifications` | 3 (list, mark-read, mark-all-read) |
| `/api/activity` | 1 (feed) |
| `/api/uploads` | 2 (upload image, delete image) |
| `/api/admin` | 1 (update user role) |
| `/api/health` `/health` `/ready` | 3 (health check, liveness, readiness) |

Socket.IO events: joinPost, leavePost, notification:new, post:likeUpdated,
comment:new, comment:updated, comment:deleted, comment:likeUpdated

---

## Database collections

9 MongoDB collections:

| Collection | Purpose |
|---|---|
| users | Accounts, roles, follow counts, token version |
| posts | Content, slugs, tags, categories, views, likes, bookmark counts |
| comments | Nested threads (parentComment), likes |
| bookmarks | User + post pairs, unique compound index |
| follows | Follower + following pairs, unique compound index |
| notifications | Typed events, read state, sender/recipient |
| activitylogs | Audit trail of user and admin actions |
| categories | Name, slug, post count |
| tags | Name, slug, post count |

---

## Test summary

| Suite | Files | Tests | Status |
|---|---|---|---|
| Backend unit (Jest) | 4 | 22 | PASS |
| Backend integration (Jest + Supertest) | 3 | 22 | PASS |
| Frontend unit/component (Vitest + RTL) | 8 | 34 | PASS |
| **Total** | **15** | **78** | **ALL PASS** |

---

## Bundle summary (production build)

| Chunk | Size (minified) | Gzipped |
|---|---|---|
| index (app shell) | 40.98 kB | 12.39 kB |
| vendor-react | 145.78 kB | 46.97 kB |
| vendor-radix | 85.35 kB | 25.80 kB |
| vendor-forms | 82.15 kB | 22.59 kB |
| vendor-motion | 109.81 kB | 36.20 kB |
| vendor-query | 42.53 kB | 12.61 kB |
| vendor-socket | 31.35 kB | 9.76 kB |
| vendor-router | 14.22 kB | 5.17 kB |
| vendor-http (axios) | 45.57 kB | 17.70 kB |
| vendor-icons | 30.40 kB | 6.04 kB |
| vendor-dates | 9.91 kB | 3.39 kB |
| vendor-charts (Recharts) | 349.01 kB | 86.65 kB |
| vendor-editor (TipTap) | 349.34 kB | 105.66 kB |
| vendor-misc | 191.89 kB | 72.23 kB |
| Route pages (27, lazy-loaded) | ~5–14 kB each | ~2–5 kB each |

The TipTap and Recharts chunks (~349 kB each minified) are only fetched when the editor or
dashboard pages are first visited. The main app shell that every user loads first is 40.98 kB.

---

## Docker support

- `backend/Dockerfile` — multi-stage Node 20 Alpine build
- `frontend/Dockerfile` — multi-stage Vite build served by nginx 1.27
- `frontend/nginx.conf` — gzip, SPA fallback routing, 30-day static asset caching
- `docker-compose.yml` — MongoDB 7 (with healthcheck), backend, frontend; single-command startup:

```
cp .env.example .env && docker compose up --build
```

---

## Deployment targets

| Target | Config file | Notes |
|---|---|---|
| Render | `render.yaml` | Blueprint for both web service (backend) and static site (frontend) |
| Railway | `backend/railway.json` | Nixpacks auto-detect, healthcheck configured |
| Vercel | `frontend/vercel.json` | SPA rewrite rule; env vars set in Vercel dashboard |
| Docker / any VM | `docker-compose.yml` | Self-hosted, add a reverse proxy for TLS |
| MongoDB Atlas | — | Connection string via MONGO_URI; see docs/DEPLOYMENT.md |

---

## Repository structure

```
blog-platform/
|-- README.md
|-- CHANGELOG.md
|-- LICENSE
|-- SECURITY.md
|-- CONTRIBUTING.md
|-- CODE_OF_CONDUCT.md
|-- RELEASE_REPORT.md
|-- .env.example
|-- .gitignore
|-- docker-compose.yml
|-- render.yaml
|-- docs/
|   |-- ARCHITECTURE.md
|   |-- API.md
|   |-- DATABASE.md
|   |-- DEPLOYMENT.md
|   |-- DEVELOPER_GUIDE.md
|-- backend/
|   |-- Dockerfile
|   |-- .dockerignore
|   |-- .gitignore
|   |-- railway.json
|   |-- jest.config.js
|   |-- package.json
|   |-- tsconfig.json
|   |-- .env.example
|   |-- src/
|       |-- server.ts
|       |-- app.ts
|       |-- config/       (db, env, cloudinary, validateEnv)
|       |-- models/       (9 Mongoose models)
|       |-- controllers/  (10 controllers)
|       |-- services/     (analytics, cloudinary, user, activity, notification)
|       |-- middleware/   (auth, validate, errorHandler, rateLimiter, upload)
|       |-- routes/       (11 route modules)
|       |-- utils/        (ApiError, logger, pagination, sendResponse, token, postHelpers,
|       |                   toUserPayload, validators/)
|       |-- sockets/      (Socket.IO init + emit helpers)
|       |-- __tests__/    (unit/ + integration/)
|-- frontend/
    |-- Dockerfile
    |-- .dockerignore
    |-- .gitignore
    |-- nginx.conf
    |-- vercel.json
    |-- vitest.config.ts
    |-- vite.config.ts
    |-- package.json
    |-- tsconfig.json
    |-- index.html
    |-- .env.example
    |-- src/
        |-- main.tsx
        |-- App.tsx
        |-- index.css
        |-- api/          (10 API service modules)
        |-- hooks/        (18 hook modules)
        |-- store/        (authStore, notificationStore, uiStore)
        |-- lib/          (axios, queryClient, utils/cn)
        |-- config/       (env)
        |-- sockets/      (socketClient)
        |-- types/        (index.ts — all shared types)
        |-- components/
        |   |-- ui/       (14 shadcn-style primitives)
        |   |-- layout/   (Navbar, Sidebar, Footer, NotificationDropdown, etc.)
        |   |-- blog/     (PostCard, CommentItem, AuthorListCard, TableOfContents, etc.)
        |   |-- editor/   (RichTextEditor, EditorToolbar, CoverImagePicker, TagInput)
        |   |-- dashboard/(ActivityFeedList)
        |   |-- shared/   (error boundaries, skeletons, empty/error states, LazyImage)
        |-- pages/
        |   |-- public/   (10 pages: home, explore, blog detail, author, tags, categories, etc.)
        |   |-- auth/     (4 pages: login, register, forgot, reset)
        |   |-- dashboard/(7 pages: overview, write, drafts, bookmarks, notifications, profile, settings)
        |   |-- admin/    (4 pages: overview, users, posts, analytics)
        |-- layouts/      (MainLayout, AuthLayout, DashboardLayout)
        |-- routes/       (ProtectedRoute, AdminRoute, GuestRoute)
        |-- test/         (setup.ts, renderWithProviders.tsx)
```

---

## Known limitations

1. **Email delivery** — The forgot-password flow returns the raw reset token in the API response
   when `NODE_ENV=development`. A transactional email provider (SendGrid, Resend, etc.) must be
   wired into `authController.ts` before the platform accepts real users.

2. **Analytics trend approximation** — Views and likes trends are bucketed by the post's creation
   month (a proxy), since those fields are running counters without per-event timestamps. Followers,
   bookmarks, and comments trends use exact timestamps. Documented in `docs/ARCHITECTURE.md`.

3. **Test coverage scope** — The test suite covers validators, utilities, the auth and admin
   controllers, health endpoints, all Zustand stores, key hooks, and representative UI components.
   Controller-level tests that require a running MongoDB use mocked models. Full integration tests
   against a real database would require `mongodb-memory-server`, which needs a downloaded binary
   not available in this build environment.

4. **Activity feed deep pagination** — The feed merges two independently-paginated sources
   (ActivityLog + Notification) in application code; results past ~page 20 are approximate.
   Fixing this properly requires a denormalized feed collection.

5. **Admin role management UI** — The confirm dialog works, but the backend does not yet support
   bulk role changes or listing pending role-change requests.

6. **E2E tests** — Playwright spec files are not included in this release; E2E testing requires a
   live running stack and installed browser binaries.
