require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const artistRoutes = require('./routes/artist.routes');
const songRoutes = require('./routes/song.routes');
const playlistRoutes = require('./routes/playlist.routes');
const dashboardController = require('./controllers/dashboard.controller');
const requireAuth = require('./middleware/auth');

const app = express();

connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing, cookies, method override, static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session needed by connect-flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(flash());

// Soft JWT decode on every request — sets req.user and res.locals.currentUser
// Does not block; protected routes use requireAuth middleware
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback');
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/artists', artistRoutes);
app.use('/songs', songRoutes);
app.use('/playlists', playlistRoutes);

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', requireAuth, dashboardController.index);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'The page you are looking for does not exist.',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: err.message || 'Something went wrong.',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

/*
  WHAT THIS FILE DOES AND WHY:
  - Entry point of the application. Wires together all middleware, routes, and the Express server.
  - Soft JWT middleware decodes the token on every request so all EJS views can read
    res.locals.currentUser without needing each route to repeat the decode step.
  - connect-flash + express-session provide one-time flash messages (success/error feedback).
  - method-override lets HTML forms send PUT and DELETE requests via ?_method= query param.
  - 404 and global error handlers both render views/error.ejs for a consistent error UI.
*/
