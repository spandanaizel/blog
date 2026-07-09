# Architecture

## Overview

Inkwell is a classic two-tier SPA + REST API architecture, with a third real-time channel
(Socket.IO) layered on top of the REST API for live updates.

```
┌─────────────────┐        REST (JSON over HTTPS)        ┌──────────────────┐
│                  │ ────────────────────────────────────▶│                  │
│  React SPA       │                                       │  Express API     │
│  (Vite, TS)      │ ◀──────────────────────────────────── │  (Node, TS)      │
│                  │        Socket.IO (WebSocket)          │                  │
└─────────────────┘ ◀────────────────────────────────────▶ └──────────────────┘
                                                                     │
                                                                     ▼
                                                            ┌──────────────────┐
                                                            │  MongoDB           │
                                                            │  (Mongoose)        │
                                                            └──────────────────┘
                                                                     │
                                                              (optional)
                                                                     ▼
                                                            ┌──────────────────┐
                                                            │  Cloudinary         │
                                                            │  (image storage)    │
                                                            └──────────────────┘
```

## Backend layout (`backend/src`)

```
config/        Environment loading, MongoDB connection, Cloudinary client
models/        Mongoose schemas (User, Post, Comment, Bookmark, Follow, Notification, ...)
controllers/   Request handlers — validate input shape is already done, call services/models
services/      Business logic that doesn't belong to a single HTTP request
                 (analyticsService, cloudinaryService, userService, activityService, notificationService)
middleware/    auth (JWT), validate (Zod), rateLimiter, upload (multer), errorHandler
routes/        One file per resource, mounted in app.ts
utils/         ApiError, pagination, token signing, post helpers, validators/
sockets/       Socket.IO server setup and emit helpers
__tests__/     Jest unit + integration tests
```

Request flow for a typical authenticated write (e.g. creating a post):

1. `routes/postRoutes.ts` — `POST /` → `protect` middleware (verifies JWT) → `validate(createPostSchema)` (Zod) → `createPost` controller
2. `controllers/postController.ts` — generates a slug, estimates read time, calls `Post.create`, fires off `ActivityLog` + `Notification` side effects
3. `services/notificationService.ts` — persists the notification and pushes it over Socket.IO via `emitToUser`
4. Response is wrapped consistently by `utils/sendResponse.ts`: `{ success, message, data, meta? }`

Errors thrown anywhere in a controller (via `ApiError` or a Mongoose error) are caught by
`express-async-handler` and routed to the single `errorHandler` middleware, which normalizes
Mongoose validation/cast/duplicate-key errors and Multer upload errors into the same response shape.

## Frontend layout (`frontend/src`)

```
api/            One file per resource — thin Axios wrappers, typed request/response shapes
hooks/          TanStack Query hooks (one per resource) + utility hooks (debounce, prefetch, upload)
store/          Zustand stores — authStore (persisted), notificationStore, uiStore (theme)
components/
  ui/           shadcn-style primitives (Button, Card, Dialog, Toast, ...) — Radix UI underneath
  layout/       Navbar, Sidebar, NotificationDropdown, ThemeToggle, ...
  blog/         PostCard, CommentItem/Section, AuthorListCard, TableOfContents, ...
  editor/       TipTap RichTextEditor, toolbar, cover image picker, tag input
  dashboard/    ActivityFeedList (virtualized)
  shared/       Error boundaries, skeletons, empty/error states, FormField
pages/          Route-level components: public/, auth/, dashboard/, admin/
layouts/        MainLayout, AuthLayout, DashboardLayout
routes/         ProtectedRoute, AdminRoute, GuestRoute guards
sockets/        Socket.IO client singleton + room helpers
```

### Data fetching

Every server resource has a matching `api/*.ts` (Axios calls, typed) and `hooks/use*.ts`
(TanStack Query wrapper). Components never call `apiClient` directly — they call a hook. This
keeps cache keys, stale times, and invalidation logic in one place per resource.

### Real-time

`useSocketConnection` (mounted once in `App.tsx`) connects to Socket.IO with the current access
token in the handshake, and feeds incoming `notification:new` events into `notificationStore`.
Per-post rooms (`joinPost`/`leavePost`) carry live comment events to anyone currently viewing that
post's detail page.

### Code splitting

Every route component is wrapped in `React.lazy` + `Suspense` (see `App.tsx`), so the initial
bundle only ships the app shell. Heavy, page-specific dependencies (TipTap, Recharts, Socket.IO)
are routed into their own named vendor chunks via `vite.config.ts`'s `manualChunks`, so they're
fetched once and cached by the browser independently of the rest of the app.

### Error handling

Three boundary types, nested intentionally:

- **`GlobalErrorBoundary`** wraps the whole app. Last resort — offers a full reload.
- **`PageErrorBoundary`** wraps each lazy route. "Try again" re-renders just that page.
- **`AsyncErrorBoundary`** wraps individual data-driven widgets (chart grids, the comment section,
  the activity feed) inside a page. A failure in one chart doesn't take down the rest of the
  dashboard.

## Graceful Cloudinary fallback

`backend/src/config/cloudinary.ts` checks whether `CLOUDINARY_CLOUD_NAME` /
`CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` are set. If not, `uploadImage()` returns the
input it was given (a base64 data URI from the upload buffer) as the `url`, with `publicId: null`.
The rest of the app — the upload endpoint, the editor, the cover image picker, the avatar
uploader — doesn't need to know which path was taken; it always gets back `{ url, publicId }`.
This means the full upload flow works end-to-end in local development without ever creating a
Cloudinary account, at the cost of storing images as inline data URIs instead of CDN-hosted files.

## Known architectural trade-offs

These are deliberate, documented simplifications rather than oversights:

- **Analytics trends for views/likes** are bucketed by *post creation month* rather than the
  actual moment each view/like happened, because `Post.views` and `Post.likes` are running
  counters, not individually timestamped events. Followers, bookmarks, and comments trends *are*
  accurate, since `Follow`, `Bookmark`, and `Comment` are all individually timestamped documents.
- **Comments are not virtualized** (unlike notifications/activity feed) because they form a
  recursive, variable-height tree; `CommentItem` is memoized instead to limit re-render cost.
- **Activity feed pagination** merges two independently-paginated sources (ActivityLog +
  Notification) in application code rather than a single Mongo query, so very deep pagination
  (page 20+) is an approximation. Acceptable at this app's scale; would need a denormalized
  "feed" collection to fix properly at larger scale.
- **Admin role management** (promote/demote a user) has UI affordance but no backend endpoint —
  it surfaces an honest "not available yet" toast rather than silently doing nothing.
