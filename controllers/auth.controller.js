const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const COOKIE_OPTIONS = {
  httpOnly: true, // js in browser cannot read this cookie
  maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry in milliseconds 7x24...
};

exports.getRegister = (req, res) => { // show registration form
  res.render('auth/register', { title: 'Register' }); //
};

exports.postRegister = async (req, res) => { //— processes form submission.
  try {
    const { username, email, password, role } = req.body;// create body
    if (!password || password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/auth/register'); // false return to page with error message
    }
    const passwordHash = await bcrypt.hash(password, 12);// hash password with bcrypt
    await User.create({ username, email, passwordHash, role: role || 'user' });//create new user mongodb
    req.flash('success', 'Account created! Please log in.');//flash success message
    res.redirect('/auth/login');
  } catch (err) {
    req.flash('error', err.code === 11000 ? 'Username or email already taken.' : err.message)// 11000 is duplicate key error
    res.redirect('/auth/register');
  }
};

exports.getLogin = (req, res) => { // show login form
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res) => { //— processes form submission.
  try {
    const { email, password } = req.body; // extract email and password from body
    const user = await User.findOne({ email }); // find user by email mongodb
    if (!user || !(await user.comparePassword(password))) { // compare password with bcrypt- return false if no email or password is wrong
      req.flash('error', 'Invalid email or password.'); // flash error message- 
      return res.redirect('/auth/login'); // return to login page with error message
    } // if valid create jwt token
    const token = jwt.sign( // create jwt token with user id, username and role
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback', //Signed with JWT_SECRET (from .env)

      { expiresIn: '7d' }
    );
    res.cookie('token', token, COOKIE_OPTIONS); // browser stores it, sends it with every request
    req.flash('success', `Welcome back, ${user.username}!`); 
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/auth/login');
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'You have been logged out.');
  res.redirect('/auth/login');
};

/*
  WHAT THIS FILE DOES AND WHY:
  - Handles register, login, and logout flows.
  - postRegister: hashes the password with bcrypt (12 salt rounds) before saving.
    Duplicate key errors (code 11000) are caught and shown as readable messages.
  - postLogin: finds user by email, uses comparePassword to verify bcrypt hash,
    then creates a signed JWT stored in an httpOnly cookie (XSS-safe).
  - logout: clears the token cookie, ending the session.
*/
