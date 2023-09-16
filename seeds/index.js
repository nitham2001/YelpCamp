const mongoose = require('mongoose');
const CampGround = require('../models/campground');
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database Connected!!")
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDb = async () => {
    await CampGround.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new CampGround({
            geometry: { type: 'Point', coordinates: [cities[random1000].longitude, cities[random1000].latitude] },
            author: "60b2fa594fc83a470011d9b9",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dzbzwrv3d/image/upload/v1622440528/YelpCamp/lxmbwjiw3wjalwpu6nui.jpg',
                    filename: 'YelpCamp/lxmbwjiw3wjalwpu6nui'
                },
                {
                    url: 'https://res.cloudinary.com/dzbzwrv3d/image/upload/v1622440530/YelpCamp/lq2ie2vxnfptqohs7ss9.jpg',
                    filename: 'YelpCamp/lq2ie2vxnfptqohs7ss9'
                },
                {
                    url: 'https://res.cloudinary.com/dzbzwrv3d/image/upload/v1622440532/YelpCamp/ymfai8rix50hhyanhngb.jpg',
                    filename: 'YelpCamp/ymfai8rix50hhyanhngb'
                }
            ],
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repellat esse molestiae quod architecto aspernatur natus, aliquid quos asperiores ea accusamus fugiat modi delectus impedit temporibus minus quis. Possimus, esse eius!",
            price: Math.floor(Math.random() * 20) + 10
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})