const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

//Using Router Route
router
  .route('/')
  .get(catchAsync(campgrounds.index)) //render all campground names
  .post(
    isLoggedIn,
    validateCampground,
    catchAsync(campgrounds.createCampground)
  ); //submit new input of campgrounds

//create new campground
//order matters, this should go first before campground/id
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
  .route('/:id')
  .get(catchAsync(campgrounds.showCampground)) // render to a specific camp
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground) //update existing camp with the info from edited page
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //delete existing campgrounds

//renders to edit page
router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
