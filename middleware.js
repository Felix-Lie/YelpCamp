const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//Login Middleware
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; //directs to the last URL previously before user sign in
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
};

// Validate Campground Middleware
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body); //validating schema with joi
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    // throw new ExpressError('Invalid Campground Data', 400)
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Author Middleware for edit and delete camp
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//Review Author Middleware to a delete review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//Validate Review Middleware
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    // throw new ExpressError('Invalid Review Data', 400)
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
