module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; //directs to the last URL previously before user sign in
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
};
