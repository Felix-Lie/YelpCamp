const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const Campground = require('../models/campground');

mongoose
  .connect('mongodb://localhost:27017/yelp-camp', {
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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //YOUR USER ID
      author: '61d62693df78de240d2601f8',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis et voluptatem labore, sapiente molestias id porro est corrupti. Quod sit corrupti consectetur est hic? Culpa illum qui aliquid excepturi ullam!',
      price: price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: 'https://res.cloudinary.com/felixlie/image/upload/v1641921363/YelpCamp/nywfmh4ybj3ejhflbwn8.jpg',
          filename: 'YelpCamp/nywfmh4ybj3ejhflbwn8',
        },
        {
          url: 'https://res.cloudinary.com/felixlie/image/upload/v1641921364/YelpCamp/etx7hjvj3u1oodyiw6di.jpg',
          filename: 'YelpCamp/etx7hjvj3u1oodyiw6di',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
