const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
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

//default home page
app.get('/', (req, res) => {
  res.render('home')
})

//render all campground names
app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

//create new campground
//order matters, this should go first before campground/id
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

//submit new input of campgrounds
app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

// render to a specific camp
app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/show', { campground })
})

//renders to edit page
app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', { campground })
})

//update existing camp with the info from edited page
app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  })
  res.redirect(`/campgrounds/${campground._id}`)
})

//delete existing campgrounds
app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
})

app.listen(3000, () => {
  console.log('SERVING ON PORT 3000')
})
