if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const mongostore = require('connect-mongo')(session);


const campgroundRouters = require('./routers/campground');
const reviewRouters = require('./routers/reviews');
const userRouters = require('./routers/users');

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database Connected!!")
});

app.engine('ejs', ejsMate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new mongostore({
    url: dbURL,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", (e) => {
    console.log("Session store error", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(
    mongoSanitize({
        replaceWith: '_',
    })
);

app.use(helmet({ contentSecurityPolicy: false }));

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRouters);
app.use('/campgrounds', campgroundRouters);
app.use('/campgrounds/:id/reviews', reviewRouters);


app.get('/', (req, res) => {
    res.render('campgrounds/home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError("Oh Not found!", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("campgrounds/error", { err });
})
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Welcome to server : ${port}`);
})