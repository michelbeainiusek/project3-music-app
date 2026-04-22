// Strict middleware — blocks the request if req.user is not set.
// server.js soft-decodes the JWT before every request, so by the time this
// middleware runs req.user is either a decoded payload or null.
const requireAuth = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/auth/login');
  }
  next();
};

module.exports = requireAuth;

/*
  WHAT THIS FILE DOES AND WHY:
  - Exports a single middleware function that enforces authentication.
  - Relies on the global soft-decode in server.js having already set req.user.
  - If req.user is null (unauthenticated or invalid token), redirects to login
    with a flash error message.
  - Used on every protected route (artists, songs, playlists, dashboard).
*/
