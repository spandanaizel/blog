# Developer Guide

## Prerequisites

- Node.js 20+
- npm
- A MongoDB instance - either local (mongod running on 27017) or a free MongoDB Atlas cluster
- Docker + Docker Compose, if you would rather skip installing Mongo locally

## Local setup (without Docker)

### Backend

Steps:
1. cd backend
2. cp .env.example .env

Edit .env: at minimum set MONGO_URI (local: mongodb://localhost:27017/blog-platform, or your
Atlas connection string) and two different random strings for JWT_ACCESS_SECRET and
JWT_REFRESH_SECRET. Cloudinary keys are optional - uploads fall back gracefully without them.

3. npm install
4. npm run dev

The API starts on http://localhost:5000. Check it with curl http://localhost:5000/api/health

### Frontend

1. cd frontend
2. cp .env.example .env
3. npm install
4. npm run dev

Opens on http://localhost:5173. The default .env.example already points at the local backend.

### Creating an admin user

There is no signup flow for admins by design. After registering a normal account, promote it
manually via the Mongo shell or Compass, setting the role field on that user document to "admin".
Log out and back in afterward so the new role is reflected in your JWT.

## Folder structure guide

See ARCHITECTURE.md for the annotated backend/src and frontend/src trees. The short version:

- backend/src has models, controllers, services, routes, middleware, utils, sockets
- frontend/src has api, hooks, store, components, pages, layouts, routes, sockets

One file per resource in api/, hooks/, routes/, and controllers/ - if you are adding a new
resource (say, "series" for grouping posts), you will touch one file in each of those directories
plus a model and a Zod validator.

## Conventions

Backend responses always go through utils/sendResponse.ts - never res.json() directly in a
controller, so every endpoint has the same success/message/data/meta shape.

Backend errors always throw ApiError factory methods (or let a Mongoose error bubble) - the single
errorHandler middleware normalizes everything. Do not catch-and-format errors inside controllers.

Frontend API calls never happen directly in a component - add a function to the matching
api file and a hook that wraps it in useQuery or useMutation. Components only ever call hooks.

Frontend forms use React Hook Form plus a Zod schema (see utils/validators/authSchemas.ts for the
pattern) and the shared FormField wrapper for label and error display.

New pages are added to App.tsx as a lazy import wrapped by the page() helper - this gets you
Suspense and a PageErrorBoundary automatically.

## Testing

### Backend (Jest + Supertest)

Run with: npm test, or npm test -- --coverage for a coverage report.

Tests live in backend/src/__tests__ (unit and integration subfolders). Unit tests cover pure
logic (validators, pagination, ApiError, post helpers). The integration tests exercise the real
Express app via supertest - some (health check, 404 handling, auth-guard checks) need no database
at all; the auth registration test mocks the User model directly with jest.mock so it can assert
on controller behavior (duplicate email, validation-before-DB-call) without a live MongoDB
connection.

Honest coverage note: this suite is a representative foundation (validators, utils, the auth
controller's main paths, and the DB-free routes), not full line coverage of every controller. Most
controllers depend on a live Mongoose connection for true integration testing; if you want to
extend coverage, mongodb-memory-server is a good next step for spinning up a real in-memory Mongo
during tests (it requires downloading a Mongo binary, which was not available in the environment
this project was built in).

### Frontend (Vitest + React Testing Library)

Run with: npm test, or npm run test:coverage for a coverage report.

Tests live next to the code they cover, in __tests__ folders. Use src/test/renderWithProviders.tsx
for any component that needs Router or QueryClient context. Same honesty note as the backend: this
is a real, passing suite covering representative pieces (stores, hooks, several UI and feature
components) rather than a claim of blanket coverage across all source files.

## Common tasks

Add a new API resource end-to-end:
1. Model in backend/src/models
2. Zod schema in backend/src/utils/validators
3. Controller plus optional service in backend/src/controllers and services
4. Routes file, mounted in backend/src/app.ts
5. An api file on the frontend
6. A hook wrapping it in useQuery or useMutation
7. Wire into a page

Add a new page:
1. Component in frontend/src/pages (public, dashboard, or admin)
2. A lazy import and route in App.tsx, wrapped in the page() helper
3. Add a nav link if it should be discoverable (Navbar.tsx or DashboardSidebar.tsx)

Debug the refresh-token flow:
The access token lives in memory (Zustand, not persisted) and the refresh token is an httpOnly
cookie scoped to /api/auth. If you get logged out unexpectedly, check that CLIENT_URL on the
backend exactly matches the frontend's origin (CORS and cookie security flags depend on it) and
that withCredentials is set to true on the Axios client (it is, by default, in
frontend/src/lib/axios.ts).
