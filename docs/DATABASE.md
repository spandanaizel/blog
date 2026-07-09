# Database

MongoDB via Mongoose. Ten collections, defined in `backend/src/models/`.

## Collections

### User
| Field | Type | Notes |
|---|---|---|
| name, username, email | String | username/email unique, lowercased |
| password | String | bcrypt hash, select:false by default |
| avatar, avatarPublicId | String | avatarPublicId is the Cloudinary asset id, used for cleanup |
| bio | String | max 280 chars |
| socialLinks | object | website, twitter, github, linkedin — all optional |
| role | string | 'user' or 'admin' |
| followersCount, followingCount | Number | denormalized counters, kept in sync by the follow controller |
| tokenVersion | Number | bumped on password change/reset to invalidate existing refresh tokens |
| resetPasswordToken, resetPasswordExpires | String, Date | select:false, sha256 hash of the raw token sent to the user |
| isActive | Boolean | soft-deactivation flag |

Indexes: unique on username, email; text index on name+username (directory search currently uses
a case-insensitive regex for substring matching instead).

### Post
| Field | Type | Notes |
|---|---|---|
| title, slug | String | slug is unique, auto-generated and de-duplicated (title-1, title-2, ...) |
| content | String | HTML from the TipTap editor |
| excerpt | String | auto-generated from content if not provided |
| coverImage, coverImagePublicId | String | |
| tags | String array | lowercased |
| category | String | lowercased |
| author | ObjectId to User | |
| readTime | Number | minutes, estimated at ~200 words per minute |
| views | Number | incremented on each detail-page fetch |
| likes | ObjectId array to User | embedded array, not a separate collection |
| bookmarks | ObjectId array to User | denormalized mirror of the Bookmark collection for quick counts |
| commentsCount | Number | denormalized |
| status | string | 'draft' or 'published' |
| publishedAt | Date | set the first time status becomes published |

Indexes: unique slug; text index on title/excerpt/tags; createdAt and views descending for sorting.

### Comment
| Field | Type | Notes |
|---|---|---|
| post | ObjectId to Post | |
| author | ObjectId to User | |
| content | String | max 1000 chars |
| parentComment | ObjectId to Comment, nullable | one level of nesting; the API flattens/rebuilds the tree on read |
| likes | ObjectId array to User | |
| isEdited | Boolean | |

### Bookmark
Fields: user, post — unique compound index on (user, post).

### Follow
Fields: follower, following — unique compound index on (follower, following).

### Notification
| Field | Type | Notes |
|---|---|---|
| recipient, sender | ObjectId to User | |
| type | string | like, comment, reply, follow, or mention (mention also covers "an author you follow published a new post") |
| post, comment | ObjectId, optional | context for the notification |
| message | String | pre-rendered human-readable text |
| isRead | Boolean | |

### Category / Tag
Lightweight lookup collections (name, slug, postCount), upserted whenever a post is created with a
new category/tag. Not currently surfaced via a dedicated listing endpoint — the frontend's
tag/category browse pages use a curated static list and filter posts live.

### ActivityLog
| Field | Type | Notes |
|---|---|---|
| user | ObjectId to User | the actor |
| action | enum | register, login, create_post, update_post, delete_post, publish_post, comment, like_post, bookmark_post, follow_user, admin_delete_post, admin_delete_user, admin_moderate_comment |
| targetId | ObjectId, optional | the post/comment/user the action was performed on |
| metadata | Mixed, optional | |

Used both as a lightweight audit trail and, combined with Notification, as the source data for the
user-facing Activity Feed (GET /api/activity).

## Relationships at a glance

```
User 1--* Post           (author)
User *--* User            (Follow: follower/following)
User *--* Post            (Bookmark)
User *--* Post            (Post.likes embedded array)
Post 1--* Comment
Comment 1--* Comment      (parentComment, one level)
User *--* Comment         (Comment.likes embedded array)
User 1--* Notification    (recipient)
User 1--* ActivityLog     (user)
```

## Why some things are denormalized

followersCount/followingCount on User, commentsCount/likes/bookmarks on Post are all counters or
embedded arrays maintained alongside their source-of-truth collections (Follow, Comment, Bookmark)
rather than computed with a $lookup on every read. This trades a small amount of write-side
bookkeeping (increment/decrement on each action) for fast list-page reads, which is the right
trade-off for a read-heavy blog.
