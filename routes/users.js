const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const users = require('../controllers/users');

//Router route to render registration page & post registration submission
router
  .route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

//Router route to render login page & authenticate login
router
  .route('/login')
  .get(users.renderLogin)
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    users.login
  );

//Route to logout
router.get('/logout', users.logout);

module.exports = router;
