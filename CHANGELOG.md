# Changelog

All notable changes to this project are documented in this file.

The format is loosely based on Keep a Changelog (keepachangelog.com), and this project follows
Semantic Versioning (semver.org).

## [1.0.0] - 2026-06-27

First production-ready release.

### Added

Authentication and accounts
- Register, login, logout, JWT access token + httpOnly-cookie refresh token with rotation
  (each successful refresh invalidates the token that was just used)
- Forgot/reset password flow
- Role-based access control (user / admin)
- Admin endpoint to promote/demote a user's role, with self-demotion prevention,
  activity logging, and a notification to the affected user

Content
- TipTap rich-text editor (headings, lists, code blocks, tables, links, images)
- Draft/publish workflow with local autosave and live preview
- Cloudinary-backed cover image, inline editor image, and avatar uploads with
  progress indicators and a graceful local fallback when Cloudinary isn't configured
- Tagging, categories, full-text search, sort, and pagination across all listings

Engagement
- Likes (optimistic UI), nested threaded comments with real-time updates via Socket.IO
- Bookmarks, follow/unfollow with live follower counts
- Real-time notifications (likes, comments, replies, follows, new posts, role changes)
  with an unread badge and read/read-all endpoints
- Unified activity feed merging authored actions and received events, with infinite scroll

Dashboard and admin
- Personal analytics (Mongo aggregation pipelines): views/likes/comments/bookmarks/followers
  trends, category distribution, monthly activity, top posts
- Admin-wide analytics, post moderation, user directory, and role management
- Profile editing (avatar, bio, social links), password change, dark mode

Engineering
- Route-level code splitting (React.lazy + Suspense) with per-page error boundaries
- Vendor chunk splitting (TipTap, Recharts, Socket.IO, Radix, etc.) - ~41 KB main entry chunk
- Virtualized notifications and activity feed lists (react-window)
- Three-tier error boundaries: global, page, and async/widget-level
- React Query caching tuned with staleTime/gcTime, hover-prefetching, and optimistic updates
  (likes, admin role changes) with rollback on failure
- Backend: Helmet, rate limiting, Mongo sanitization, Zod validation throughout,
  startup environment validation (fails fast in production on missing/insecure secrets),
  Winston logging of auth/admin/upload/error events
- GET /health (liveness) and GET /ready (readiness, checks MongoDB), alongside GET /api/health
- Jest + Supertest backend tests (unit tests for validators/utils/error-handling; integration
  tests for health/readiness, auth registration, and admin role management) and
  Vitest + React Testing Library frontend tests (stores, hooks, and key components)
- Docker (multi-stage builds, nginx for the SPA, Compose with a MongoDB service)
- Deployment configs for Render, Railway, and Vercel; full deployment documentation

### Known limitations

See docs/ARCHITECTURE.md and docs/DEVELOPER_GUIDE.md for the full, honest list of intentional
trade-offs and scope boundaries. Highlights:
- Views/likes analytics trends are approximated (bucketed by post creation month), since those
  fields are running counters rather than individually timestamped events. Followers, bookmarks,
  and comments trends are exact.
- Backend/frontend test suites cover representative, meaningful logic (validators, utils, auth,
  admin role management, stores, hooks, key UI components) rather than a blanket 80%+
  line-coverage claim across every controller and page. Most controllers depend on a live
  MongoDB connection for true integration testing; this wasn't available in the sandboxed
  environment this project was built in (no outbound access to MongoDB's binary download host),
  so deeper coverage is the clearest next step for whoever picks this codebase up.
- End-to-end browser testing (e.g. Playwright) is not yet part of this repository — it's a
  reasonable next addition, but would require installing browser binaries and running the full
  stack (frontend + backend + MongoDB) together, neither of which was available here.
