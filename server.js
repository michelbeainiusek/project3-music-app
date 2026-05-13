// middlewear run for every request
require('dotenv').config();// load env variables fromenv into proce.env
const express = require('express');// get espress
const path = require('path');//built in path module
const cookieParser = require('cookie-parser');// read cookies from incoming request
const methodOverride = require('method-override');//ets forms send PUT/DELETE requests (HTML forms only support GET/POST)
const flash = require('connect-flash'); // one-time notification messages ("Artist created!")
const jwt = require('jsonwebtoken');// used in the soft-decode middleware below

// import riyte and conenct db 
const connectDB = require('./config/db');// connect to database
const authRoutes = require('./routes/auth.routes');
const artistRoutes = require('./routes/artist.routes');
const songRoutes = require('./routes/song.routes');
const playlistRoutes = require('./routes/playlist.routes');
const dashboardController = require('./controllers/dashboard.controller');

const requireAuth = require('./middleware/auth'); //middleware to check if user is authenticated- if yes next middlewear-else go to login

const app = express(); // create express app

connectDB(); // connect to database

// View engine
app.set('view engine', 'ejs'); //  tells Express to use EJS for rendering HTML templates
app.set('views', path.join(__dirname, 'views'));//tells Express where to find those templates (project3/views/)


// Body parsing, cookies, method override, static files
app.use(express.urlencoded({ extended: true })); //parse form fields from req.body- if send form and make data avaible
app.use(express.json()); //parse JSON request bodies
app.use(cookieParser()); // make cookie readble
app.use(methodOverride('_method')); // forms can do get or psot not delte, read and make it work like it delete
app.use(express.static(path.join(__dirname, 'public'))); //serve static files directly (CSS, JS)

// Session needed by connect-flash- flash need somewhere to live- req.flash('success', 'Artist created!')
app.use(session({ //Sets up a temporary memory space for this user's session — needed so flash messages (step 6) have somewhere to live.
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false, //don't re-save session if nothing changed
  saveUninitialized: false,//  — don't create a session until data is actually stored
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(flash()); //Flash messages are one-time notifications like "Artist created successfully!" — they show once then disappear. This step makes those available.



//On every request, it checks "who is this person?" by reading their JWT cookie and verifying it's real. 
// Then makes that info available to the whole app.
// without this decode jwt at every controller
app.use((req, res, next) => {
  const token = req.cookies.token; // read jwt cookie
  if (token) { // if token is there try to verify it or if has been tempered with
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback');// verify and se if expired or not
    } catch { // if token is not valid set req.user to null- treat as logged out
      req.user = null; // redirect to login apge thanks to requireauth
    }
  } else {
    req.user = null;
  }
  res.locals.currentUser = req.user; // "who is browsing right now" — set once in server.js, available everywhere automatically
  res.locals.success = req.flash('success');//reads flash messages (this also clears them, so they only show once)
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
