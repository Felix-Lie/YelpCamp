//USERS CONTROLLERS
//TO KEEP THE USER ROUTES PAGE CLEANER

const User = require('../models/user');

//Controller that renders to register page
module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

//Controller that submits registration
module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      // no need to login after register
      if (err) return next(err);
      req.flash('success', 'Welcome to Yelp Camp');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

//Controller that renders to login page
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

//Controller that authenticate to login page
module.exports.login = (req, res) => {
  req.flash('success', 'You are logged in, Welcome Back!');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

//Controller that redirect to logout page and logout user
// module.exports.logout = (req, res) => {
//   req.logout();
//   req.flash('success', 'Goodbye!');
//   res.redirect('/campgrounds');
// };

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.flash('success', 'Goodbye!');
  res.redirect('/campgrounds');
};
