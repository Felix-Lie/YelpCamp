const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelper')
const Campground = require('../models/campground')
const { toLocaleString } = require('./cities')

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

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  const c = new Campground({ title: 'purple field' })
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis et voluptatem labore, sapiente molestias id porro est corrupti. Quod sit corrupti consectetur est hic? Culpa illum qui aliquid excepturi ullam!',
      price: price,
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})