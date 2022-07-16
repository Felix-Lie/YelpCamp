if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

//packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//security packages
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require('connect-mongo')(session);

const dbUrl = 'mongodb://localhost:27017/yelp-camp';
// 'mongodb://localhost:27017/yelp-camp'
// const dbUrl = process.env.DB_URL;
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MONGO CONNECTION OPEN');
  })
  .catch((err) => {
    console.log('ERROR, MONGO CONNECTION');
    console.log(err);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error'));
db.once('open', () => {
  console.log('Database Connected');
});

const app = express();

app.engine('ejs', ejsMate); //using this to styling boilerplates
app.set('view engine', 'ejs'); //to enable ejs files
app.set('views', path.join(__dirname, 'views')); //to help with directories

app.use(express.urlencoded({ extended: true })); //to parse new inputs
app.use(methodOverride('_method')); //to allow edits/delete on existing campground
app.use(express.static(path.join(__dirname, 'public'))); //to serve static files
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
//sanitizes user-supplied data to prevent MongoDB Operator Injection.

//session
const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net/',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net/',
];
const connectSrcUrls = [
  'https://*.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://events.mapbox.com',
];
const fontSrcUrls = [];

app.use(session(sessionConfig));
app.use(flash());

//Helmet helps secure Express apps by setting various HTTP headers.
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/felixlie/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

//default home page
app.get('/', (req, res) => {
  res.render('home');
});

//error path for unavaialble directories
//order matters, so if the routes is not mentioned above, then error
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

//error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('SERVING ON PORT 3000');
});
