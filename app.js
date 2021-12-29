const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utilities/ExpressError')
const methodOverride = require('method-override')

const Campground = require('./models/campground')
const Review = require('./models/review')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

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
app.use(express.static(path.join(__dirname, 'public'))) //to serve static files

//xession
const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}
app.use(session(sessionConfig))
app.use(flash())

//flash
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

//routes
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

//default home page
app.get('/', (req, res) => {
  res.render('home')
})

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
