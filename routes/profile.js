var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var axios = require("axios");
var maletheuser = require("../models/maleUser");
var mealinfo = require("../models/mealInfo");
var calorieinfo = require("../models/calorieInfo");
var userfood = require("../models/userFood");
const femaleUser = require("../models/femaleUser");
var macronutrientinfo = require("../models/macroNutrientInfo");
var user = require("../models/user");
var onDate = require("../models/onDate");
const { request } = require("express");

var userType;
var gender = "";
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        if (gender === "male") {
            userType = maletheuser
        }
        if (gender === "female") {
            userType = femaleUser
        }
    }
    next();
});
var dateNow = (new Date(Date.now())) //IST time
// console.log("dateNow" + dateNow)
// !SHOW - profile
router.get("/viewProfile", middleware.isLoggedIn, function (req, res) {

    userType.findOne({
        username: req.user.username
    }, function (err, founduser) {
        if (err) {
            console.log(err);
        } else {
            // console.log(founduser)
            //render show template with that campground
            res.render("profile/viewProfile", {
                founduser: founduser
            });
        }
    });
});

// ! EDIT profile
router.get("/editProfile", middleware.isLoggedIn, function (req, res) {
    userType.findOne({
        username: req.user.username
    }, function (err, founduser) {
        if (err) {
            console.log(error);
        } else {
            res.render("profile/editProfile", {
                founduser: founduser
            });

        }

    });
});

// !UPDATE 
router.put("/viewProfile", middleware.isLoggedIn, async (req, res) => {
       
     try {
        var findedUser = await userType.findOne({
            username: req.user.username
        })
    } catch (err) {
                console.log(err)

    }
    let DOB = req.body.DOB
    let A 
    getAge(DOB)
    function getAge(DOB) {
    var today = new Date();
    var birthDate = new Date(DOB);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
        A = age
    }

       let count = 0;
        let goal;
        let W = req.body.weight;
        let H = req.body.height;
        
    let goal_number = Number(req.body.goal)
    let bmi = (W/((H/100)*(H/100))).toFixed(2)
   
       try {
        let updateuser = await user.findOneAndUpdate({
            username: req.user.username
        }, {
            username: req.body.username
        }, {
            upsert: true,
            new: true
        });
        // console.log(req.user.username+" "+req.body.new.username)
            } catch (err) {
                console.log(err)
            }

    if (req.body.gender === "male") {
         bmr = 10 * W + 6.25 * H - 5 * A + 5;
            goal_calories = ((bmr * req.body.activityFactor) + (goal_number*1000) ).toFixed(2);
    } else if (req.body.gender === "female") {
        bmr = 10 * W + 6.25 * H - 5 * A - 161;
        goal_calories = ((bmr * req.body.activityFactor) + (goal_number*1000) ).toFixed(2);
    }
    
    if (req.body.goal < 0) goal = "Loss"
    else if (req.body.goal > 0) goal = "Gain"
    else if (req.body.goal == 0.0) goal = "Maintain"

    
    let update = {
        username: req.body.username,
        email:req.body.email,
        DOB: req.body.DOB,
        gender: req.body.gender,
        goal: goal,
        goal_calories: goal_calories,
        goal_number :goal_number,
        height: req.body.height,
        weight: req.body.weight,
        neck: req.body.neck,
        waist: req.body.waist,
        hip: req.body.hip,
        activityFactor: req.body.activityFactor,
        bmi: bmi,
        bodyfat: req.body.fatPer,
        bmr: bmr,
        age:A
       }

    
    try {
        let updatedUsertype = await userType.findOneAndUpdate({
            username: req.user.username
        }, update, {
            upsert: true,
            new: true
        });
    } catch (err) {
        console.log(err)
    }
    try {
        let updatedOnDate = await onDate.findOneAndUpdate({
            date: dateNow.toLocaleDateString(),
            username: req.user.username
        }, update,{
            upsert: true
        });
    userType.findOne({
        username: req.user.username
    }).populate('ondate').exec(function (err, ondateinfo) {
        if (err) {
            console.log(err)
        } else {
            ondateinfo.ondate.forEach(function (dateinfo) {
                if (dateinfo.date == updatedOnDate.date) {
                    dateinfo = updatedOnDate;
                    count++;
                }
                    
            })
            if (count != 0) {
                ondateinfo.ondate.push(updatedOnDate);
                ondateinfo.save(function (err, saved) {
                    if (err) {
                        console.log(err)
                    } else {
                        // console.log(saved);
                    }
                })
            }
        }
    })
    } catch (err) {
        console.log(err)
    }
    res.redirect("/viewProfile");
})
router.get("/editRatios", middleware.isLoggedIn, async (req, res) => {
    try {
        let ratio = {};
        var findeduser = await userType.findOne({
            username: req.user.username
        });
        if (findeduser.activityFactor == 1.2) {
            ratio["carbs"] = findeduser.inactive_carbsRatio;
            ratio["protiens"] = findeduser.inactive_protiensRatio;
            ratio["fats"] = findeduser.inactive_fatsRatio;
        } else if (findeduser.activityFactor == 1.375 || findeduser.activityFactor == 1.55) {

            ratio["carbs"] = findeduser.med_carbsRatio;
            ratio["protiens"] = findeduser.med_protiensRatio;
            ratio["fats"] = findeduser.med_fatsRatio;

        } else {
            ratio["carbs"] = findeduser.high_carbsRatio;
            ratio["protiens"] = findeduser.high_protiensRatio;
            ratio["fats"] = findeduser.high_fatsRatio;
        }
        res.render("profile/editRatios", {
            findeduser: findeduser,
            ratio: ratio
        })

    } catch (err) {
        console.log(err);
    }
});

router.put("/editRatios", middleware.isLoggedIn, async (req, res) => {
    let update_obj = {}; //contains ratios and target
    var findeduser = await userType.findOne({
        username: req.user.username
    });
    let goal_calories = findeduser.goal_calories
    if (findeduser.activityFactor == 1.2) {
        update_obj["inactive_carbsRatio"] = req.body.eratio["carbs"];
        update_obj["inactive_protiensRatio"] = req.body.eratio["protiens"];
        update_obj["inactive_fatsRatio"] = req.body.eratio["fats"];

        update_obj["p_target"] =( goal_calories * req.body.eratio["protiens"] / 400).toFixed(2);
        update_obj["f_target"] = (goal_calories * req.body.eratio["fats"] / 900).toFixed(2);
        update_obj["c_target"] = (goal_calories * req.body.eratio["carbs"] / 400).toFixed(2);
    } else if (findeduser.activityFactor == 1.375 | findeduser.activityFactor == 1.55) {

        update_obj["med_carbsRatio"] = req.body.eratio["carbs"];
        update_obj["med_protiensRatio"] = req.body.eratio["protiens"];
        update_obj["med_fatsRatio"] = req.body.eratio["fats"];

        update_obj["p_target"] = (goal_calories * req.body.eratio["protiens"] / 400).toFixed(2);
        update_obj["f_target"] = (goal_calories * req.body.eratio["fats"] / 900).toFixed(2);
        update_obj["c_target"] = (goal_calories * req.body.eratio["carbs"] / 400).toFixed(2);

    } else {
        update_obj["high_carbsRatio"] = req.body.eratio["carbs"];
        update_obj["high_protiensRatio"] = req.body.eratio["protiens"];
        update_obj["high_fatsRatio"] = req.body.eratio["fats"];

        update_obj["p_target"] = (goal_calories * req.body.eratio["protiens"] / 400).toFixed(2);
        update_obj["f_target"] = (goal_calories * req.body.eratio["fats"] / 900).toFixed(2);
        update_obj["c_target"] = (goal_calories * req.body.eratio["carbs"] / 400).toFixed(2);
    }

    var updateuser = await userType.findOneAndUpdate({
            username: req.user.username
        },
        update_obj, {
            new: true,
            upsert: true // Make this update into an upsert
        });
    res.redirect("back")

});

module.exports = router;

