// all the middleware goes here
var maletheuser = require("../models/maleUser");
var femaleuser = require("../models/femaleUser");

var middlewareObj = {};
var gender;
var userType;
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        gender = req.user.gender;
        if (gender === "male") {
            userType = maletheuser
        }
        if (gender === "female") {
            userType = femaleuser
        }
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.counterLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated()) {

        return next();
    }
    res.redirect('/addMeal')
}

middlewareObj.isMe = function (req, res, next) {
    if (req.user) {
        if(req.user.isme)
         return next();
    }
     req.flash("error", "You are not allowed to do that");
    res.redirect('/addMeal')
}

module.exports = middlewareObj;