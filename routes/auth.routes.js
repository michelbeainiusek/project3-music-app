const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');

router.get('/register', ctrl.getRegister);// see regform
router.post('/register', ctrl.postRegister);// write to db
router.get('/login', ctrl.getLogin); // see login form
router.post('/login', ctrl.postLogin); // check credentials
router.post('/logout', ctrl.logout); // clear cookie

module.exports = router;
