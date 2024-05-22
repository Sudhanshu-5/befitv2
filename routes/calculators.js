var express = require("express");
var router = express.Router();
var maletheuser = require("../models/maleUser");
var ondate = require("../models/onDate");
var femaleuser = require("../models/femaleUser");
var middleware = require("../middleware");
var userType;
var gender;
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        if (gender === "male") {
            userType = maletheuser
        }
        if (gender === "female") {
            userType = femaleuser
        } 
    }

    next();
});
var dateNow = (new Date(Date.now())) //IST time

//! request to bmr form


router.get("/bmr", middleware.isLoggedIn, function (req, res) {

    userType.findOne({
        username: req.user.username
    }, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            res.render("others/bmrform", {
                info: info
            })
        }
    })
})
router.get("/bodyfat", middleware.isLoggedIn, function (req, res) {

    userType.findOne({
        username: req.user.username
    }, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            res.render("others/bodyfatForm", {
                info: info
            })
        }
    })
})

//!calculate BMR
router.post("/bmr", middleware.isLoggedIn, async (req, res) => {
    let info;
    let W = req.body.weight;
    let H = req.body.height;
    let A = req.body.age;
    if (req.user.gender === "male") {

        bmr = 10 * W + 6.25 * H - 5 * A + 5;
        bmr = bmr * req.body.factor;
    }
    if (req.user.gender === "female") {
        bmr = 10 * W + 6.25 * H - 5 * A - 161;
        bmr = bmr * req.body.factor;
    }

    var data = {
        weight: req.body.weight,
        height: req.body.height,
        age: req.body.age,
        bmr: bmr,
        activityFactor: req.body.factor
    }
    try {
        info = await userType.findOneAndUpdate({
            username: req.user.username
        }, data, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(er)
    }
    try {
        let updatedOnDate = await ondate.findOneAndUpdate({
            date: dateNow.toLocaleDateString(),
            username: req.user.username
        }, data, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
   res.redirect("/viewProfile");
})

router.post("/bodyfat", middleware.isLoggedIn, async (req, res) => {
    let info;
  
    var data = {
        waist: req.body.waist,
        height: req.body.height,
        neck: req.body.neck,
        hip: req.body.hip,
        gender: req.body.gender,
        bodyfat: req.body.bodyfat
    }
    try {
        info = await userType.findOneAndUpdate({
            username: req.user.username
        }, data, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(er)
    }
    try {
        let updatedOnDate = await ondate.findOneAndUpdate({
            date: dateNow.toLocaleDateString(),
            username: req.user.username
        }, data, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
    res.redirect("/viewProfile");
    
});

module.exports = router;