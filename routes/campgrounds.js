const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

//render all campground names
router.get('/', catchAsync(campgrounds.index));

//create new campground
//order matters, this should go first before campground/id
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//submit new input of campgrounds
router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(campgrounds.createCampground)
);

// render to a specific camp
router.get('/:id', catchAsync(campgrounds.showCampground));

//renders to edit page
router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

//update existing camp with the info from edited page
router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.updateCampground)
);

//delete existing campgrounds
router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
