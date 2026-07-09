# Inkwell — A Modern Blogging Platform

Inkwell is a full-stack blogging platform inspired by Medium, Dev.to, and Hashnode — built with a
production-style architecture: a typed Express/MongoDB API, a React/TypeScript SPA, real-time
notifications over Socket.IO, and a rich-text editor with Cloudinary-backed image uploads.

This repository contains two independent applications:

```
blog-platform/
├── backend/    Express + TypeScript + MongoDB API
├── frontend/   React + TypeScript + Vite SPA
├── docs/       Architecture, API, database, deployment, and developer docs
└── docker-compose.yml
```

For deep dives, see the [`docs/`](./docs) folder:

| Doc | Contents |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System design, request lifecycle, real-time architecture |
| [`docs/API.md`](./docs/API.md) | Full REST endpoint reference |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | MongoDB collections, schemas, relationships |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Render/Railway/Vercel/Atlas deployment steps |
| [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) | Local setup, folder structure, conventions, testing |

---

## Feature inventory

**Authentication** — register/login/logout, JWT access + refresh tokens (httpOnly cookie),
forgot/reset password, role-based access (`user` / `admin`), protected & guest-only routes.

**Authoring** — TipTap rich-text editor (headings, lists, code blocks, tables, links, images),
Cloudinary-backed cover image and inline image uploads with progress indicators, tag input,
category select, local autosave, live preview, draft/publish workflow.

**Reading & discovery** — home feed (trending/latest), full-text search, filter by
category/tag/author, sort (newest/oldest/popular/most-liked), tag & category browsing, paginated
listings everywhere.

**Engagement** — likes (optimistic UI), nested threaded comments with replies and likes (real-time
via Socket.IO), bookmarks, follow/unfollow with live follower counts, table of contents on long
posts, share buttons.

**Social** — author directory with search, public author profiles (bio, social links, stats),
followers/following lists, real-time notifications (likes/comments/replies/follows/new posts) with
an unread badge, a unified activity feed (published/updated posts, received likes/comments/
bookmarks, new followers) with infinite scroll.

**Dashboard** — overview with live analytics (Mongo aggregation pipelines: views/likes/comments/
bookmarks/followers trends, category distribution, top posts), drafts management, bookmarks,
notifications, profile editing (avatar upload, bio, social links), password change, dark mode.

**Admin panel** — platform-wide analytics, post moderation (remove any post), user directory.

**Engineering** — route-level code splitting (lazy + Suspense), virtualized long lists
(notifications, activity feed) via `react-window`, three-tier error boundaries (global/page/async),
React Query caching with prefetch-on-hover and optimistic updates, Dockerized for one-command
local startup, Jest/Supertest backend tests and Vitest/RTL frontend tests.

---

## Tech stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Radix UI primitives (shadcn-style),
React Router, TanStack Query, Zustand, React Hook Form + Zod, Framer Motion, TipTap, Recharts,
Socket.IO client.

**Backend** — Node.js, Express, TypeScript, Mongoose/MongoDB, JWT + bcrypt, Cloudinary, Socket.IO,
Helmet, express-rate-limit, express-mongo-sanitize.

---

## Quick start (Docker — recommended)

The fastest way to run the whole stack (MongoDB + API + SPA) is Docker Compose:

```bash
cp .env.example .env        # then fill in JWT secrets (and optionally Cloudinary keys)
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

Image uploads work without Cloudinary keys too — see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#graceful-cloudinary-fallback)
for how the fallback behaves.

## Quick start (without Docker)

```bash
# Backend
cd backend
cp .env.example .env         # point MONGO_URI at a local or Atlas database
npm install
npm run dev                  # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                  # http://localhost:5173
```

Full setup instructions, including running tests, are in
[`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md).

---

## Scripts

| Location | Command | Purpose |
|---|---|---|
| `backend/` | `npm run dev` | Start the API with hot reload (ts-node + nodemon) |
| `backend/` | `npm run build` | Compile TypeScript to `dist/` |
| `backend/` | `npm start` | Run the compiled production server |
| `backend/` | `npm test` | Run the Jest test suite |
| `backend/` | `npm test -- --coverage` | Run tests with a coverage report |
| `frontend/` | `npm run dev` | Start the Vite dev server |
| `frontend/` | `npm run build` | Type-check (`tsc -b`) and build for production |
| `frontend/` | `npm test` | Run the Vitest suite |
| `frontend/` | `npm run test:coverage` | Run tests with a coverage report |

---

## Screenshots

Not included in this repository — see [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) for
how to run the app locally and capture your own once it's deployed or running.

---

## Production checklist

See the end of [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full pre-launch checklist
(environment variables, CORS, health checks, logging, secrets rotation).

## License

MIT — built as a portfolio/learning project.
