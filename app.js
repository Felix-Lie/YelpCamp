const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Joi = require('joi') //lets you describe your data using a simple, intuitive, and readable language.
const { campgroundSchema } = require('./schemas.js')
const catchAsync = require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const methodOverride = require('method-override')
const Campground = require('./models/campground')

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MONGO CONNECTION OPEN')
  })
  .catch((err) => {
    console.log('ERROR, MONGO CONNECTION')
    console.log(err)
  })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection Error'))
db.once('open', () => {
  console.log('Database Connected')
})

const app = express()

app.engine('ejs', ejsMate) //using this to styling boilerplates
app.set('view engine', 'ejs') //to enable ejs files
app.set('views', path.join(__dirname, 'views')) //to help with directories

app.use(express.urlencoded({ extended: true })) //to parse new inputs
app.use(methodOverride('_method')) //to allow edits/delete on existing campground

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body) //validating schema with joi
  if (error) {
    const msg = error.details.map((el) => el.message).join(',')
    // throw new ExpressError('Invalid Campground Data', 400)
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

//default home page
app.get('/', (req, res) => {
  res.render('home')
})

//render all campground names
app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
  })
)

//create new campground
//order matters, this should go first before campground/id
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

//submit new input of campgrounds
app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// render to a specific camp
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
  })
)

//renders to edit page
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
  })
)

//update existing camp with the info from edited page
app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

//delete existing campgrounds
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
  })
)

//error path for unavaialble directories
//order matters, so if the routes is not mentioned above, then error
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

//error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
  console.log('SERVING ON PORT 3000')
})
