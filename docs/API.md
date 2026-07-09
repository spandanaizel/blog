# API Reference

Base URL: `http://localhost:5000/api` (or your deployed backend's `/api` path).

All responses share a consistent envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { "...": "endpoint-specific payload" },
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

`meta` is only present on paginated list endpoints. Errors use the same envelope with
`"success": false` and an HTTP status in the 4xx/5xx range.

**Auth header**: `Authorization: Bearer <accessToken>` for any endpoint marked locked.
**Admin-only** endpoints are marked admin. Endpoints marked optional work with or without a
token (behavior may differ slightly when authenticated — e.g. `isFollowing` flags appear).

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | public | Create an account. Body: `name, username, email, password`. Sets the refresh-token cookie and returns `{ user, accessToken }`. |
| POST | `/login` | public | Body: `email, password`. Same response shape as register. |
| POST | `/logout` | public | Clears the refresh-token cookie. |
| POST | `/refresh` | cookie | Reads the httpOnly refresh cookie, returns a new `{ accessToken, user }` if valid. |
| GET | `/me` | locked | Returns the current user's profile. |
| POST | `/forgot-password` | public | Body: `email`. Always returns the same message regardless of whether the email exists (no enumeration). In development, also returns a raw `resetToken` since no email service is wired up. |
| POST | `/reset-password` | public | Body: `token, password`. Invalidates all existing sessions (`tokenVersion` bump). |

## Posts — `/api/posts`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | optional | List posts. Query: `page, limit, category, tag, author, search, sort (newest, oldest, popular, mostLiked), status`. |
| GET | `/:slug` | optional | Single post by slug + up to 4 related posts. Increments the view counter. |
| POST | `/` | locked | Create a post (draft or published). Body matches the Post fields below. |
| PUT | `/:id` | locked | Update a post. Owner or admin only. |
| DELETE | `/:id` | locked | Delete a post (and its Cloudinary cover image, if any). Owner or admin only. |
| POST | `/:id/like` | locked | Like a post. |
| DELETE | `/:id/like` | locked | Unlike a post. |

Create/update body:

```json
{
  "title": "string (3-150 chars)",
  "content": "string (HTML from the editor, min 10 chars)",
  "excerpt": "string, optional (auto-generated if omitted)",
  "coverImage": "string (URL), optional",
  "coverImagePublicId": "string, optional - from the upload endpoint",
  "tags": ["string", "up to 10"],
  "category": "string",
  "status": "draft or published"
}
```

## Comments — `/api/comments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | locked | Body: `post, content, parentComment?`. Emits `comment:new` to the post's room and a notification to the post/comment author. |
| GET | `/:postId` | public | Returns the full comment tree (top-level comments with nested `replies`) for a post. |
| PUT | `/:id` | locked | Edit your own comment. |
| DELETE | `/:id` | locked | Delete your own comment (or any comment, if admin) — also deletes its direct replies. |
| POST | `/:id/like` | locked | Toggle like on a comment. |

## Bookmarks — `/api/bookmarks`

All routes require auth.

| Method | Path | Description |
|---|---|---|
| GET | `/` | List your bookmarks (with the bookmarked post populated). |
| POST | `/` | Body: `postId`. |
| DELETE | `/:id` | `:id` may be either the bookmark's own id or the post's id. |

## Follow — `/api/follow`

All routes require auth.

| Method | Path | Description |
|---|---|---|
| POST | `/:userId` | Follow a user. Sends a follow notification and logs `follow_user` activity. |
| DELETE | `/:userId` | Unfollow a user. |

## Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | optional | Directory search. Query: `page, limit, search`. Includes `isFollowing` per user if authenticated. |
| GET | `/:username` | optional | Public profile (bio, social links, follower/following counts, published post count). |
| GET | `/profile/me` | locked | Your own full profile (includes email). |
| PUT | `/profile` | locked | Update `name, bio, avatar, avatarPublicId, socialLinks`. Cleans up the previous Cloudinary avatar if replaced. |
| PUT | `/change-password` | locked | Body: `currentPassword, newPassword`. Verifies the current password with bcrypt; invalidates other sessions. |
| GET | `/:id/posts` | optional | Paginated posts by user id. Query: `page, limit, status` (drafts only visible to the owner/admin). |
| GET | `/:id/followers` | optional | Paginated followers list. |
| GET | `/:id/following` | optional | Paginated following list. |

## Analytics — `/api/analytics`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | locked | Your own stats: posts/draft counts, totals (views/likes/comments/bookmarks), 6-month trends, category distribution, monthly activity, top 5 posts. |
| GET | `/admin` | admin | Platform-wide equivalent, plus top 5 authors by follower count. |
| GET | `/user/:id` | locked | Same shape as `/dashboard` for an arbitrary user — self or admin only (403 otherwise). |

All trend data comes from real Mongo aggregation pipelines — see ARCHITECTURE.md for which
trends are exact vs. approximated.

## Notifications — `/api/notifications`

All routes require auth.

| Method | Path | Description |
|---|---|---|
| GET | `/` | Paginated list, newest first. `meta` includes an extra `unreadCount` field. |
| PATCH | `/:id/read` | Mark one notification read. |
| PATCH | `/read-all` | Mark all of your notifications read. |

New notifications also arrive in real time over Socket.IO as a `notification:new` event (see
below) — the REST endpoints are for the initial load and pagination.

## Activity — `/api/activity`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | locked | Unified, newest-first feed merging your own publish/update actions with events you received (likes, comments, replies, follows, bookmarks on your posts). |

## Uploads — `/api/uploads`

All routes require auth.

| Method | Path | Description |
|---|---|---|
| POST | `/image` | `multipart/form-data` with an `image` field (JPEG, PNG, WEBP, or GIF, max 5MB) and a `category` field (`avatar`, `cover`, or `editor`). Returns `{ url, publicId }`. |
| DELETE | `/image` | Body: `{ publicId }`. Removes the asset from Cloudinary. |

If Cloudinary credentials aren't configured, `url` falls back to the uploaded image encoded as a
data URI and `publicId` is `null` — see ARCHITECTURE.md.

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | public | `{ success: true, message: "API is healthy", timestamp }`. Doesn't touch the database — safe to use as a liveness probe. |

---

## Socket.IO events

Connect to the same origin as the API with `auth: { token: accessToken }` in the handshake.

| Event | Direction | Payload | Notes |
|---|---|---|---|
| `joinPost` | client to server | `postId` | Join a post's room to receive its live comment/like events. |
| `leavePost` | client to server | `postId` | Leave that room. |
| `notification:new` | server to client | Notification (populated sender) | Pushed to the recipient's private room. |
| `post:likeUpdated` | server to room | `{ postId, likesCount }` | |
| `comment:new` / `comment:updated` / `comment:deleted` / `comment:likeUpdated` | server to room | comment payload | Scoped to `post:<postId>` rooms. |

## Rate limiting

- General API: 300 requests per 15 minutes per IP.
- Auth endpoints (`/register`, `/login`, `/forgot-password`, `/reset-password`): 20 per 15 minutes per IP.
