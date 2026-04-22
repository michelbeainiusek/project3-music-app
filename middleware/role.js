// Factory function — returns a middleware that enforces a specific role.
// Usage: requireRole('admin') on routes that only admins should access.
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    req.flash('error', 'You do not have permission to perform this action.');
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = requireRole;

/*
  WHAT THIS FILE DOES AND WHY:
  - Exports a factory function so the required role can be specified per-route.
  - requireRole('admin') is applied to all write routes (POST, PUT, DELETE) on
    Artist, Song, and Playlist — only admins can create, edit, or delete records.
  - Regular 'user' role can still reach GET routes (index, show) which only use requireAuth.
*/
