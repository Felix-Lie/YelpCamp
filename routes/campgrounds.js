const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body); //validating schema with joi
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    // throw new ExpressError('Invalid Campground Data', 400)
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//render all campground names
router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

//create new campground
//order matters, this should go first before campground/id
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

//submit new input of campgrounds
router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully Made a new Campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// render to a specific camp
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    );
    if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  })
);

//renders to edit page
router.get(
  '/:id/edit',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);

//update existing camp with the info from edited page
router.put(
  '/:id',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//delete existing campgrounds
router.delete(
  '/:id',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Delete Campground');
    res.redirect('/campgrounds');
  })
);

module.exports = router;
