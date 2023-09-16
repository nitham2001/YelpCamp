const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const user = require('../controllers/user');

router.route('/register')
    .get((user.registerForm))
    .post(catchAsync(user.createAccount))

router.route('/login')
    .get((user.loginForm))
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (user.login))

router.get('/logout', (user.logout))

module.exports = router;
