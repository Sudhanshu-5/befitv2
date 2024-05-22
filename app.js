//!importing  required dpendencies
var express = require("express");
var mongoose = require("mongoose");
var user = require("./models/user");
var maletheuser = require("./models/maleUser");
var femaleuser = require("./models/femaleUser");

var passport = require("passport");
var LocalStrategy = require("passport-local");
var bodyParser = require("body-parser");
var axios = require("axios");
var middleware = require("./middleware");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var back = require("express-back"); //access previous paths
var app = express();
require("dotenv").config(); //for env variables
const moment = require("moment-timezone");
const dateNow = moment.tz(Date.now(), "Asia/Calcutta");

//!import routes
var indexRoute = require("./routes/index.js");
var mealsRoute = require("./routes/meals.js");
var exerciseRoute = require("./routes/exercise.js");
var trends = require("./routes/trends.js");
var calculator = require("./routes/calculators.js");
var profile = require("./routes/profile.js");
var report = require("./routes/report.js");

const { asyncify } = require("async");
//!depreciate related stuff
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

//!mongo atlas connection String
mongoose
  .connect(process.env.Mongo_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch((err) => {
    console.log("ERRORs:", err.message);
  });
app.use(flash());

//!app config
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  require("express-session")({
    secret: "going to know u soon",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(methodOverride("_method"));
app.use(express.static("./public"));
app.use(flash());
app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});
app.use(back());

//!passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
var userType;
//!calculate time
var now = new Date();
var time = now.getHours();

//!check if for navbar login
let loginLink = "not logged";
//!passing data to all the tempelates
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;

  res.locals.loginLink = loginLink;

  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.info = req.flash("info");

  res.locals.flag = true;
  if (req.user) {
    gender = req.user.gender;
    if (gender === "male") {
      userType = maletheuser;
    }
    if (gender === "female") {
      userType = femaleuser;
    }
    res.locals.extractUser = user();
    res.locals.time = time;
  }

  next();
});

//!homepage
app.get("/", middleware.counterLoggedIn, function (req, res) {
  res.render("others/index");
});

async function user(req, res) {
  try {
    var extractUser = await userType.findOne({
      username: req.user.username,
    });
    return extractUser;
  } catch (err) {
    return err;
  }
}

app.use(mealsRoute);
app.use(exerciseRoute);
app.use(trends);
app.use(indexRoute);
app.use(calculator);
app.use(profile);
app.use(report);

app.listen(process.env.PORT || 3001, function () {
  console.log("started");
});
