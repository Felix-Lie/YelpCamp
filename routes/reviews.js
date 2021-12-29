const express = require('express')
const router = express.Router({ mergeParams: true })

const Campground = require('../models/campground')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas.js')

const ExpressError = require('../utilities/ExpressError')
const catchAsync = require('../utilities/catchAsync')

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    // throw new ExpressError('Invalid Review Data', 400)
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

//post review of each individual campground
router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    review.save()
    campground.save()
    req.flash('success', 'Created New Review!')
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

//to delete a review
router.delete(
  '/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully Delete Review')
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router
