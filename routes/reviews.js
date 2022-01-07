const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const catchAsync = require('../utilities/catchAsync');

//post review of each individual campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//to delete a review
router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
