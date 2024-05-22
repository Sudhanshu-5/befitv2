var express = require("express");
var router = express.Router();
var maletheuser = require("../models/maleUser");
var femaleuser = require("../models/femaleUser");
var exerciseinfo = require("../models/exerciseInfo");
var calorieinfo = require("../models/calorieInfo");
var userexercise = require("../models/userExercise");
var middleware = require("../middleware");
var macronutrientinfo = require("../models/macroNutrientInfo");

var axios = require("axios");
const {
    session
} = require("passport");
const {
    request
} = require("express");

var dateNow = (new Date(Date.now()));

var userType;
var gender = "";
//set user model according to gender
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

//!add exercise for particcular user
router.get("/addExercise", middleware.isLoggedIn, async (req, res) => {
    try {
        var findedUser = await userType.findOne({
            username: req.user.username
        }).populate("userexercise");
        
        let age = findedUser.age;
        let Gender = gender;
        let weight = findedUser.weight;
        let height = findedUser.height;
        res.render("exercise/addExercise", {
            findedUser: findedUser,
            age: age,
            weight: weight,
            height: height

        });


    } catch (err) {
        console.log(err);
    }

});

//!call nutrient api  add details to db
router.post("/addExercise", middleware.isLoggedIn, function (req, res) {
    
    let usum = 0;
    let uExerciseName = [];
    let uDuration = [];
    let uMet = [];
    let uCaloriesBurned = [];
    if (req.body.myExerciseName) {
        let userExercise = req.body.myExerciseName;
        let userDuration = req.body.myExerciseDuration.map(Number);

        for (let i = 0; i < userExercise.length; i++) {
            userExercise[i] = userExercise[i].trim();
            userexercise.findOne({
                exercise_name: userExercise[i]
            }, function (err, exercise) {
                if (err) {
                    console.log(err)
                } else {
                   
                    triggered(exercise);
                }

            })

            function triggered(exercise) {

                let factor;
                factor = (userDuration[i] / exercise.duration);
                factor = factor.toFixed(2);
                usum = usum + exercise.burnedcalories * factor;
                uCaloriesBurned.push(exercise.burnedcalories * factor);
                uMet.push(exercise.met);
                uDuration.push(userDuration[i]);
                uExerciseName.push(userExercise[i]);
               
            }

        }
    }
    let caloriesBurned = [];
    let durations = [];
    let exercises = [];
    let met = [];
    let label = req.body.xlabelDescription;
    let totalBurnedcalories = 0;
    let time = req.body.time;
    var info = req.body.query; //api requirement to add info to post
    axios({
        method: "post",
        url: "https://trackapi.nutritionix.com/v2/natural/exercise",
        headers: {
            //"content-type": "text/json", 
            //"Content-Type": "application/json", 
            "x-app-id": "4b34a3d8",
            "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
            "x-remote-user-id": "0"

        },
        data: {
            "query": info,
            "gender": req.user.gender,
            "weight_kg": req.body.weight,
            "height_cm": req.body.height,
            "age": req.body.age
        }

    }).then(function (response) {


        for (var i = 0; i < response.data.exercises.length; i++) {
            caloriesBurned.push(response.data.exercises[i].nf_calories);
            durations.push(response.data.exercises[i].duration_min);
            exercises.push(response.data.exercises[i].user_input);
            met.push(response.data.exercises[i].met);
            totalBurnedcalories = totalBurnedcalories + response.data.exercises[i].nf_calories;
        }


    }).catch(function (error) {
        console.log(error)
  

    }).finally(function () {
        if (!exercises.length && !uExerciseName.length) {
            req.flash('error', 'exercise cannot be found in our database. Try to add in custom  exercise.')
            res.redirect('back')
        }
        else {
            totalBurnedcalories = totalBurnedcalories + usum;

            caloriesBurned = caloriesBurned.concat(uCaloriesBurned)
            // console.log("------------" + caloriesBurned);
            durations = durations.concat(uDuration);
            // console.log("----------" + durations)
            exercises = exercises.concat(uExerciseName);
            // console.log("-----------" + exercises);
            met = met.concat(uMet);
            if (exercises.length) {
                var data = {
                    caloriesBurnedPerExercise: caloriesBurned,
                    duration: durations,
                    exerciseName: exercises,
                    met: met,
                    session: label,
                    totalCaloriesBurned: totalBurnedcalories,
                    time: time
                }
                //!create exercise info
                exerciseinfo.create(data,
                    function (err, data) {
                        if (err) {
                            console.log("error" + err)
                        } else {
                            //!push and save exercise info to maletheuser
                            userType.findOne({
                                username: req.user.username
                            }, function (err, findedUser) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    findedUser.exerciseinfo.push(data);
                                    findedUser.save(function (err, addedData) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                        }
                                    });
                                    //!total values
                                    userType.findOne({
                                        username: req.user.username
                                    }).populate("exerciseinfo").populate("macroNutrientInfo").exec(function (err, workoutinfo) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            var totalCalorie = parseFloat(data.totalCaloriesBurned);

                                            if (workoutinfo.macroNutrientInfo.length > 0) {
                                                workoutinfo.exerciseinfo.forEach(function (info) {
                                                    if ((new Date(info.createdAt)).toLocaleDateString().localeCompare(dateNow.toLocaleDateString()) == 0) {
                                                        totalCalorie = totalCalorie + parseFloat(info.totalCaloriesBurned);
                                                    }


                                                });
                                            }



                                            macronutrientinfo.findOneAndUpdate({
                                                date: dateNow.toLocaleDateString(),
                                                username: req.user.username
                                            }, {
                                                totalCaloriesBurned: totalCalorie,
                                            }, {
                                                new: true,
                                                upsert: true // Make this update into an upsert
                                            }, function (err, updatedCalorieInfo) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                  
                                                    let count = 0;
                                                    if (workoutinfo.macroNutrientInfo.length == 0) {
                                                        workoutinfo.macroNutrientInfo.push(updatedCalorieInfo);
                                                        workoutinfo.save(function (err, saved) {
                                                            if (err) {
                                                                console.log(err)
                                                            } else {
                                                            }
                                                        })
                                                        //

                                                        // if ((new Date(info.createdAt)).toLocaleDateString() !== dateNow.toLocaleDateString()) {

                                                        // foodinfo.save(function (err, saved) {
                                                        //     if (err) {
                                                        //         console.log(err)
                                                        //     } else {
                                                        //         console.log(saved);
                                                        //     }
                                                        // })
                                                        // }

                                                        // })
                                                    } else {
                                                        workoutinfo.macroNutrientInfo.forEach(function (info) {
                                                            if (info.createdAt.toLocaleDateString() == updatedCalorieInfo.createdAt.toLocaleDateString()) {
                                                                count++;
                                                            }
                                                        })
                                                        if (count == 0) {
                                                            workoutinfo.macroNutrientInfo.push(updatedCalorieInfo);
                                                            workoutinfo.save(function (err, saved) {
                                                                if (err) {
                                                                    console.log(err)
                                                                } else {
                                                                }
                                                            })
                                                        }
                                                    }
                                                }
                                            })
                                        
                                        }
                                    });


                                }
                            });
                            req.flash('info', 'Exercise is added to ur  diary');
                            res.redirect('back');
                        }
                    });
            }

        }
    })

});

router.delete("/deleteExercise", middleware.isLoggedIn, async (req, res) => {

    let millisecondsOfItemsToBeRemoved = req.query.millisecondsOfItemsToBeRemoved;
    let indexOfItemsToBeRemoved = req.query.indexOfItemsToBeRemoved;
    let index = parseInt(indexOfItemsToBeRemoved);
    let findedExerciseId;
    let findMacroDoc;
    let date = (new Date((parseInt(millisecondsOfItemsToBeRemoved)))).toLocaleDateString();
    
    let findedExercise = await userType.findOne({
        username: req.user.username
    }).populate("exerciseinfo");
    //get macronutrientdoc
    try {
        findMacroDoc = await macronutrientinfo.findOne({

            username: req.user.username,
            date: date
        });
        console.log("findedMacro " + findMacroDoc);
    } catch (err) {
        console.log(err)
    }

    function updateMacronutrientInfo(i) {

        macronutrientinfo.findOneAndUpdate({
            username: req.user.username,
            date: dateNow.toLocaleDateString()

        }, {
            totalCaloriesBurned: (findMacroDoc.totalCaloriesBurned - findedExercise.exerciseinfo[i].caloriesBurnedPerExercise[index]).toFixed(2)
           
        }, {
            new: true
        }, function (err, updatedMacronutrient) {
            if (err) {
                console.log(err);
            } else {
                console.log("updatedMacroNutrientInfo " + updatedMacronutrient);

            }
        })
    }


    for (let i = 0; i < findedExercise.exerciseinfo.length; i++) {

        //get document of provided millisecond to manipulate
        if (JSON.stringify(new Date(findedExercise.exerciseinfo[i].createdAt).getTime()) === millisecondsOfItemsToBeRemoved) {
            findedExerciseId = findedExercise.exerciseinfo[i]._id;

            if (findedExercise.exerciseinfo[i].caloriesBurnedPerExercise.length === 1) {
                //update maconutirentinfo
                //delete
                //show targets
                updateMacronutrientInfo(i);
                let deleteDoc = await exerciseinfo.findByIdAndDelete(findedExerciseId);
                res.send(millisecondsOfItemsToBeRemoved) //to change update progress bars
            } else {

                //update mealinfo
                //update maconutirentinfo
                //delete
                //show targets

                updateMacronutrientInfo(i);
                exerciseinfo.findByIdAndUpdate(
                    findedExerciseId, {
                    totalCaloriesBurned: (findedExercise.exerciseinfo[i]. totalCaloriesBurned - findedExercise.exerciseinfo[i].caloriesBurnedPerExercise[index])
                        
                    }, {
                        new: true
                    },
                    function (err, updatedExerciseInfo) {

                        if (err) {
                            console.log(err)
                        } else {
                            var caloriesBurnedPerExercise = `caloriesBurnedPerExercise.${index}`;
                            var duration = `duration.${index}`;
                            var exerciseName = `exerciseName.${index}`;
                            var met = `met.${index}`;
                    
                            exerciseinfo.findByIdAndUpdate(
                                findedExerciseId, {
                                    $unset: {
                                        [caloriesBurnedPerExercise]: 1,
                                        [duration]: 1,
                                        [exerciseName]: 1,
                                        [met]: 1

                                    }
                                },
                                function (err, updatedExerciseinfo) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("updated " + updatedExerciseinfo)
                                    }
                                });

                        }
                    })
                res.send(millisecondsOfItemsToBeRemoved)
            }
        }
    }


})

//!manage diasry

router.get("/exerciseDiary", middleware.isLoggedIn, async (req, res) => {
    try {
        var findedUser = await userType.findOne({
            username: req.user.username
        }).populate("exerciseinfo");

        res.render("exercise/exerciseDiary", {
            findedUser: findedUser
        });
    } catch (err) {
        console.log(err);
    }
});

//!custom Exercise

router.get("/customExercise", middleware.isLoggedIn, function (req, res) {
    userType.findOne({
        username: req.user.username
    }).populate("userexercise").exec(function (err, populated) {
        if (err) {
            console.log(err);
        } else {
            res.render("exercise/userexercise", {
                myexercise: populated
            })
        }
    })
})

router.post("/customExercise", middleware.isLoggedIn, function (req, res) {

    let completeObj = req.body.info;
 
    userexercise.create(
        completeObj,
        function (err, info) {
            if (err) {
                console.log(err);
            } else {
                // console.log("info" + info);
                userType.findOne({
                    username: req.user.username
                }, function (err, finded) {
                    finded.userexercise.push(info);
                    finded.save(function (err, saved) {
                        if (err) {
                            console.log(err);
                        } else {
                            // console.log(saved);
                            req.flash('info', ' custom execise added');
                            res.redirect('back');
                        }
                    })
                })
            }

        })
})

//!get execise suggestion
router.get("/suggestion", middleware.isLoggedIn, async (req, res) => {
    try {
        let calories = req.query.calories;
        let duration_obj = {};
        let info = "30 min walking 30 min running 30 min bicycling ";
        let findeduser = await userType.findOne({
            username: req.user.username
        });
        axios({
            method: "post",
            url: "https://trackapi.nutritionix.com/v2/natural/exercise",
            headers: {
                //"content-type": "text/json", 
                //"Content-Type": "application/json", 
                "x-app-id": "4b34a3d8",
                "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
                "x-remote-user-id": "0"

            },
            data: {
                query: info,
                weight_kg: 63.5,

            }

        }).then(function (response) {

            duration_obj.walking_duration = Math.round((calories * response.data.exercises[0].duration_min) / response.data.exercises[0].nf_calories);
            duration_obj.running_duration = Math.round((calories * response.data.exercises[1].duration_min) / response.data.exercises[1].nf_calories);
            duration_obj.cycling_duration = Math.round((calories * response.data.exercises[2].duration_min) / response.data.exercises[2].nf_calories);

            res.render("exercise/suggestions", {
                duration: duration_obj,
                calories: calories
            })
        }).catch(function (error) {
            console.log(error)

        }).finally(function () {

        })

    } catch (error) {
        console.log(error)
    }
})
module.exports = router;