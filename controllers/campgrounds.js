const CampGround = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });


module.exports.index = async (req, res) => {
    const camps = await CampGround.find({});
    res.render('campgrounds/index', { camps });
}

module.exports.newForm = async (req, res) => {
    res.render('campgrounds/new');
}

module.exports.details = async (req, res) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!camp) {
        req.flash('error', 'Campground which your looking was not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/details', { camp });
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id);
    if (!camp) {
        req.flash('error', 'Campground which your looking was not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/Edit', { camp });
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.CampGround.location,
        limit: 1
    }).send()
    const camp = new CampGround(req.body.CampGround);
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.author = req.user._id;
    camp.geometry = geoData.body.features[0].geometry;
    await camp.save();
    req.flash('success', 'Successfully created Campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, req.body.CampGround);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.CampGround.location,
        limit: 1
    }).send()
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground!');
    res.redirect('/campgrounds');
}