# GLOSSARY – Project 3 MusicApp

## Models (`models/`)

### `User` (`user.model.js`)
| Field | Type | Purpose |
|---|---|---|
| `username` | String | Unique login identifier (minlength: 3) |
| `email` | String | Unique email, lowercased |
| `passwordHash` | String | bcrypt hash of the user's password — plain text is never stored |
| `role` | String enum | `'admin'` or `'user'` — controls what routes are accessible |
| `createdAt / updatedAt` | Date | Auto-managed by Mongoose timestamps |

**Methods:**
- `comparePassword(plain)` → `Promise<Boolean>` — compares a plain-text password against the stored bcrypt hash

---

### `Artist` (`artist.model.js`)
| Field | Type | Purpose |
|---|---|---|
| `name` | String | Artist name — unique, required |
| `country` | String | Origin country, defaults to `'Unknown'` |
| `bio` | String | Short biography, defaults to `''` |

**Relationships:** One Artist → many Songs (Song stores `artist` ObjectId ref)

---

### `Song` (`song.model.js`)
| Field | Type | Purpose |
|---|---|---|
| `title` | String | Song title, required |
| `duration` | Number | Length in seconds (min: 1) |
| `releaseYear` | Number | Four-digit year (min: 1900) |
| `artist` | ObjectId → Artist | Many-to-one ref; required |
| `playlists` | [ObjectId → Playlist] | Many-to-many ref; kept in sync with Playlist.songs |

---

### `Playlist` (`playlist.model.js`)
| Field | Type | Purpose |
|---|---|---|
| `name` | String | Playlist name, required |
| `description` | String | Optional description |
| `songs` | [ObjectId → Song] | Many-to-many ref; kept in sync with Song.playlists |

---

## Middleware (`middleware/`)

### `requireAuth` (`auth.js`)
- **Purpose:** Blocks unauthenticated requests to protected routes
- **How:** Checks if `req.user` is set (populated by the global soft-decode in `server.js`). If null → flash error + redirect to `/auth/login`
- **Used on:** Every route except `/auth/*`

### `requireRole(role)` (`role.js`)
- **Purpose:** Factory that returns role-enforcement middleware
- **How:** Checks `req.user.role === role`. If not → flash error + redirect to `/dashboard`
- **Used on:** All write routes (POST, PUT, DELETE on artists, songs, playlists) — only `admin` role passes

---

## Controllers (`controllers/`)

### `auth.controller.js`
| Export | HTTP | Purpose |
|---|---|---|
| `getRegister` | GET `/auth/register` | Render register form |
| `postRegister` | POST `/auth/register` | Hash password, create User, redirect to login |
| `getLogin` | GET `/auth/login` | Render login form |
| `postLogin` | POST `/auth/login` | Verify credentials, sign JWT, set httpOnly cookie |
| `logout` | POST `/auth/logout` | Clear JWT cookie, redirect to login |

### `dashboard.controller.js`
| Export | HTTP | Purpose |
|---|---|---|
| `index` | GET `/dashboard` | Count Artists/Songs/Playlists in parallel, render dashboard |

### `artist.controller.js`
| Export | HTTP | Purpose |
|---|---|---|
| `index` | GET `/artists` | List all artists sorted by name |
| `show` | GET `/artists/:id` | Show artist + their songs |
| `renderCreate` | GET `/artists/new` | Render create form |
| `create` | POST `/artists` | Create artist, redirect |
| `renderEdit` | GET `/artists/:id/edit` | Render edit form |
| `update` | PUT `/artists/:id` | Update artist |
| `destroy` | DELETE `/artists/:id` | Delete artist + cascade delete their songs |

### `song.controller.js`
| Export | HTTP | Purpose |
|---|---|---|
| `index` | GET `/songs` | List all songs (populated with artist) |
| `show` | GET `/songs/:id` | Song detail (populated artist + playlists) |
| `renderCreate` | GET `/songs/new` | Render create form with artist/playlist dropdowns |
| `create` | POST `/songs` | Create song + sync playlists |
| `renderEdit` | GET `/songs/:id/edit` | Render edit form |
| `update` | PUT `/songs/:id` | Update song + diff & sync playlist assignments |
| `destroy` | DELETE `/songs/:id` | Remove song from playlists, then delete |
| `renderManagePlaylists` | GET `/songs/:id/playlists` | Relationship management view |
| `updatePlaylists` | POST `/songs/:id/playlists` | Save playlist checkbox selection |

### `playlist.controller.js`
| Export | HTTP | Purpose |
|---|---|---|
| `index` | GET `/playlists` | List all playlists |
| `show` | GET `/playlists/:id` | Playlist detail (nested populate: songs → artist) |
| `renderCreate` | GET `/playlists/new` | Render create form |
| `create` | POST `/playlists` | Create playlist |
| `renderEdit` | GET `/playlists/:id/edit` | Render edit form |
| `update` | PUT `/playlists/:id` | Update playlist name/description |
| `destroy` | DELETE `/playlists/:id` | Remove playlist ref from songs, then delete |
| `renderManageSongs` | GET `/playlists/:id/songs` | Relationship management view |
| `updateSongs` | POST `/playlists/:id/songs` | Save song checkbox selection |

---

## Routes (`routes/`)

| File | Prefix | Guards |
|---|---|---|
| `auth.routes.js` | `/auth` | None (public) |
| `artist.routes.js` | `/artists` | requireAuth on all; requireRole('admin') on write ops |
| `song.routes.js` | `/songs` | requireAuth on all; requireRole('admin') on write ops + relationship routes |
| `playlist.routes.js` | `/playlists` | requireAuth on all; requireRole('admin') on write ops + relationship routes |

---

## Views (`views/`)

### Partials (`views/partials/`)
| File | Purpose |
|---|---|
| `header.ejs` | HTML `<head>`, opens `<body>` |
| `navbar.ejs` | Navigation bar, flash messages, opens `<main>` |
| `footer.ejs` | Footer, mobile nav JS, closes `<main>`, `<body>`, `<html>` |

### Variables available in all views via `res.locals`
| Variable | Type | Source |
|---|---|---|
| `currentUser` | Object or null | Global soft JWT decode in `server.js` |
| `success` | String[] | `req.flash('success')` |
| `error` | String[] | `req.flash('error')` |
| `title` | String | Passed per `res.render()` call |

### Auth Views
| File | Template variables |
|---|---|
| `auth/login.ejs` | `title` |
| `auth/register.ejs` | `title` |

### Dashboard
| File | Template variables |
|---|---|
| `dashboard/index.ejs` | `title`, `artistCount`, `songCount`, `playlistCount`, `currentUser` |

### Artist Views
| File | Template variables |
|---|---|
| `artists/index.ejs` | `title`, `artists[]` |
| `artists/show.ejs` | `title`, `artist`, `songs[]` |
| `artists/create.ejs` | `title` |
| `artists/edit.ejs` | `title`, `artist` |

### Song Views
| File | Template variables |
|---|---|
| `songs/index.ejs` | `title`, `songs[]` (artist populated) |
| `songs/show.ejs` | `title`, `song` (artist + playlists populated) |
| `songs/create.ejs` | `title`, `artists[]`, `playlists[]` |
| `songs/edit.ejs` | `title`, `song`, `artists[]`, `playlists[]` |
| `songs/manage-playlists.ejs` | `title`, `song` (playlists populated), `allPlaylists[]` |

### Playlist Views
| File | Template variables |
|---|---|
| `playlists/index.ejs` | `title`, `playlists[]` |
| `playlists/show.ejs` | `title`, `playlist` (songs → artist nested populated) |
| `playlists/create.ejs` | `title` |
| `playlists/edit.ejs` | `title`, `playlist` |
| `playlists/manage-songs.ejs` | `title`, `playlist` (songs populated), `allSongs[]` (artist populated) |

### Error View
| File | Template variables |
|---|---|
| `error.ejs` | `title`, `message` |

---

## Key Patterns

### Many-to-Many Sync
When a Song's playlist assignments change:
1. Compute `removed` = oldIds not in newIds
2. Compute `added` = newIds not in oldIds
3. `$pull` the Song's `_id` from all `removed` Playlists
4. `$addToSet` the Song's `_id` into all `added` Playlists
5. Save the new `playlists` array on the Song

The same logic is mirrored in the Playlist controller when a Playlist's songs change.

### JWT Auth Flow
1. User logs in → server signs a JWT with `{ id, username, role }` payload
2. JWT stored in an **httpOnly cookie** (inaccessible to JavaScript — prevents XSS)
3. Every request: global middleware in `server.js` decodes the cookie and sets `req.user`
4. Protected routes: `requireAuth` checks `req.user` is set
5. Admin routes: `requireRole('admin')` checks `req.user.role === 'admin'`

### method-override
HTML forms only support GET and POST. `method-override` reads the `?_method=` query parameter so form submissions can be treated as PUT or DELETE by Express.
