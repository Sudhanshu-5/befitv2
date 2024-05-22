var express = require("express");
var router = express.Router();
var maletheuser = require("../models/maleUser");
var femaleuser = require("../models/femaleUser");
var exerciseinfo = require("../models/exerciseInfo");
var calorieinfo = require("../models/calorieInfo");
var userexercise = require("../models/userExercise");
var middleware = require("../middleware");
var macronutrientinfo = require("../models/macroNutrientInfo");
var middleware = require("../middleware");
var userType;
var gender;
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        // console.log("gender" + gender)
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
console.log("dateNow" + dateNow)


router.get("/report", middleware.isLoggedIn, async (req, res) => {
    try {
        let findeduser = await userType.findOne({
            username: req.user.username
        }).populate("macroNutrientInfo");
        res.render("report/mainReport", {
            findeduser: findeduser
        })
    } catch (err) {
        console.log(err)
    }
});

router.get("/generateReport", middleware.isLoggedIn, async (req, res) => {
    try {

        let findeduser = await userType.findOne({
            username: req.user.username
        });
        console.log(findeduser)
        let calorieinfo = await userType.findOne({
            username: req.user.username
        }).populate('macroNutrientInfo');

        res.render("report/generate_repo", {
            userinfo: findeduser,
            calorieinfo: calorieinfo,
            from: req.query.from,
            to: req.query.to,
            selected: req.query.selected
        })
    } catch (err) {
        console.log(err)
    }
});

module.exports = router;