# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues by emailing **security@inkwell.example.com**.

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Affected versions
- Any suggested fixes

You will receive an acknowledgement within 48 hours and a full response within 7 days. If the
issue is confirmed, we will release a patch as soon as possible depending on complexity.

## Security Controls in This Release

**Authentication**
- JWT access tokens (short-lived, 15 min default) + httpOnly, SameSite=Strict refresh tokens
- Refresh token rotation on every use — reuse of a consumed token is rejected
- Token version stored in the database; bumped on password change, reset, and logout to
  immediately invalidate all existing sessions
- bcrypt password hashing (cost factor 12)
- Forgot-password tokens are SHA-256 hashed before storage; raw tokens are never persisted

**Transport and input**
- Helmet sets secure HTTP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
- express-mongo-sanitize prevents NoSQL injection via query key sanitization
- express-rate-limit: 300 req/15 min general, 20 req/15 min on auth endpoints
- Zod schema validation on every request body before it touches a controller
- Multer enforces MIME type allowlist (JPEG, PNG, WEBP, GIF) and a 5 MB hard cap on uploads
- express.json body size capped at 10 MB

**Access control**
- Middleware-enforced role checks (protect, requireAdmin) on every non-public route
- Admins cannot change their own role (prevents accidental lockout and privilege games)
- Post edits and deletes are owner-or-admin only
- Draft posts are invisible to non-owners and non-admins in all listing queries

**Environment**
- Production startup validates that JWT secrets are set and non-default before accepting connections
- Cloudinary credentials are optional; missing credentials trigger a local fallback, not a crash
- CORS allows exactly one origin (CLIENT_URL); credentials flag enabled only for that origin

**Monitoring**
- Winston logs auth events (register, login, failed login, token refresh), admin actions
  (role changes, post deletions), and upload activity with user IDs and timestamps

## Out of Scope

- No email delivery is implemented; the forgot-password flow returns the raw token in the
  API response when NODE_ENV=development. A transactional email provider must be wired in
  before accepting real users.
- Content moderation is manual (admin panel); there is no automated hate-speech or spam filter.
