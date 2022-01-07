const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const Campground = require('../models/campground');

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
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Made a new Campground');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// render to a specific camp
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'author',
        },
      })
      .populate('author');
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
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash('error', 'Cannot find that campground!');
      return req.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
  })
);

//update existing camp with the info from edited page
router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

//delete existing campgrounds
router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Delete Campground');
    res.redirect('/campgrounds');
  })
);

module.exports = router;
