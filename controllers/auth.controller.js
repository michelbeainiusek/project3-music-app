const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

exports.postRegister = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!password || password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/auth/register');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ username, email, passwordHash, role: role || 'user' });
    req.flash('success', 'Account created! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    req.flash('error', err.code === 11000 ? 'Username or email already taken.' : err.message);
    res.redirect('/auth/register');
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback',
      { expiresIn: '7d' }
    );
    res.cookie('token', token, COOKIE_OPTIONS);
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
