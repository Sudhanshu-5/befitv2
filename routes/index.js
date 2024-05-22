var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");
var bodyParser = require("body-parser");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var async = require("async");
var maletheuser = require("../models/maleUser");
var femaleuser = require("../models/femaleUser");
var middleware = require("../middleware");
var userdata = require("../models/mealInfo");
const ondate = require("../models/onDate");

var dateNow = (new Date(Date.now())) //IST time

const {
    EDESTADDRREQ
} = require("constants");
const {
    findOne,
    exists
} = require("../models/user");
const { type } = require("os");

router.use(bodyParser.urlencoded({
    extended: true
}));



var gender;
router.use(function (req, res, next) {
    if (req.user) {
        gender = req.user.gender;
        console.log("meals" + gender);

        console.log("gender" + gender)
        if (gender === "male") {
            userType = maletheuser
        }
        if (gender === "female") {
            userType = femaleuser
        }
    }

    next();
});

//!register new user

router.get("/register", middleware.counterLoggedIn, function (req, res) {
    res.render("auth/register");
})

//!create new user and add to DB

router.post("/register", async (req, res) => {
   
    if ((req.body.password.toLowerCase()).localeCompare(req.body.confirmPass.toLowerCase()) == 0) {
        
        let flag = false;
        let newlyCreated;
        let W = req.body.kgs;
        let H = req.body.height;
        let A = req.body.age;
        let factor = req.body.activityFactor; //initislly , user can personalize it
        let bmr;
        let targets = {};
        let goal

        if(Number(req.body.goal) < 0)
            goal = "Lose"
       else if (Number(req.body.goal) > 0)
            goal = "Gain"
       else if (Number(req.body.goal) == 0)
            goal = "Maintain"
        
        let goal_calories 
        let goal_number = Number(req.body.goal);
        if (req.body.password == process.env.secret) {
            flag = true;
        }
        if (req.body.gender === "male") {

            bmr = 10 * W + 6.25 * H - 5 * A + 5;
            goal_calories = ((bmr * factor) + (goal_number*1000) ).toFixed(2);
        } else if (req.body.gender === "female") {
                bmr = 10 * W + 6.25 * H - 5 * A - 161;
            goal_calories = ((bmr * factor) + (goal_number*1000) ).toFixed(2);
        }
        //!get targets
        if (factor == 1.2) {
            targets["pTarget"] = (goal_calories * 30 / 400).toFixed(2);
            targets["fTarget"] = (goal_calories * 20 / 900).toFixed(2);
            targets["cTarget"] = (goal_calories * 50 / 400).toFixed(2);


        } else if (factor == 1.375 || factor == 1.55) {

            targets["pTarget"] = (goal_calories * 15 / 400).toFixed(2);
            targets["fTarget"] = (goal_calories * 30 / 900).toFixed(2);
            targets["cTarget"] = (goal_calories * 55 / 400).toFixed(2);

        } else if (factor == 1.72 || factor == 1.9) {
            targets["pTarget"] = (goal_calories * 25 / 400).toFixed(2);
            targets["fTarget"] = (goal_calories * 30 / 900).toFixed(2);
            targets["cTarget"] = (goal_calories* 45 / 400).toFixed(2);
        }
      
        var newUser = new user({
            username: req.body.username,
            gender: req.body.gender,
            email: req.body.email,
            isme:flag

        });
        user.register(newUser, req.body.password, async (err, user) => {
            if (err) {

                if (err.name === 'MongoError' && err.code === 11000) {

                    req.flash('error', 'Email address already exists')
                } else {
                    req.flash('error', err.message);
                }
                res.redirect("/register");
            } else {
                if (req.body.gender == "male") {
                    var newMaleUser = new maletheuser({
                        username: req.body.username,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        height: req.body.height,
                        weight: req.body.kgs,
                        neck: req.body.neck,
                        waist: req.body.waist,
                        hip: req.body.hip,
                        bodyfat: req.body.bodyfat,
                        DOB: req.body.date,
                        bmi: req.body.bmi,
                        age: req.body.age,
                        bmr: bmr,
                        activityFactor: factor,
                        p_target: targets["pTarget"],
                        f_target: targets["fTarget"],
                        c_target: targets["cTarget"],
                        goal: goal,
                        goal_calories:goal_calories,
                        goal_number:goal_number
                    })

                    try {
                        newlyCreated = await maletheuser.create(newMaleUser);
                    } catch (err) {
                        console.log(err)
                    }
                }
                if (req.body.gender == "female") {
                    var newFemaleUser = new femaleuser({
                        username: req.body.username,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        height: req.body.height,
                        weight: req.body.kgs,
                        neck: req.body.neck,
                        waist: req.body.waist,
                        bodyfat: req.body.bodyfat,
                        hip: req.body.hip,
                        bodyType: req.body.bodyType,
                        bmi: req.body.bmi,
                        DOB: req.body.date,
                        age: req.body.age,
                        bmr: bmr,
                        activityFactor: factor,
                        goal: goal,
                        goal_calories:goal_calories,
                        goal_number:goal_number
                    });
                    try {
                        newlyCreated = await femaleuser.create(newFemaleUser);
                        // console.log("new female user  " + newlyCreated);
                    } catch (err) {
                        console.log(err)
                    }


                }
                try {
                    let updatedOnDateInfo = await ondate.findOneAndUpdate({
                        date: dateNow.toLocaleDateString(),
                        username: req.body.username
                    }, {
                        date: dateNow.toLocaleDateString(),
                        bmr: bmr,
                        weight: req.body.kgs,
                        height: req.body.height,
                        neck: req.body.neck,
                        waist: req.body.waist,
                        activityFactor: factor

                    }, {
                        new: true,
                        upsert: true // Make this update into an upsert
                    });
                    newlyCreated.ondate.push(updatedOnDateInfo);
                    newlyCreated.save(function (err, saved) {
                        if (err) {
                            console.log(err)
                        } else {
                            // console.log(saved);
                        }
                    });
                } catch (err) {
                    console.log(err);
                }
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/login");
                });
            }


        });



    } else {
        req.flash('error', 'passwords did\'nt match')
        res.redirect("/register");
    }
})
//!instant validate
router.get("/validate", async (req, res) => {
    
    let exists
    try {
        if (req.query.Username.length > 0) {
            exists = await user.findOne({
                username: req.query.Username
            })
        } else if (req.query.Email.length > 0) {
            exists = await user.findOne({
                email: req.query.Email
            })

        }
    } catch (err) {
        console.log(err)
    }
    if (exists)
        res.send(true)
    else
        res.send(false)
})

//!show login form
router.get("/login", middleware.counterLoggedIn, function (req, res) {

    res.render("auth/login", {
        loginLink: "/login"
    });
});

//!handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/addMeal",
    failureRedirect: "/login",
    successFlash: true,
    failureFlash: true
}), function (req, res) {
    res.render("auth/login", {
        error: req.flash("error"),
    });
});



//!logout
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//! forgot password get
router.get("/forgotPass", function (req, res) {
    res.render('auth/forgot');
});


router.post('/forgotPass', function (req, res, next) {
    async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                user.findOne({
                    email: req.body.email
                }, function (err, user) {
                    if (!user) {
                        req.flash('error', 'No account with that email address exists.');

                        return res.redirect('/forgotPass');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'yawalkarsry@gmail.com',
                        pass: process.env.GMAILPW
                    }
                });

                var mailOptions = {
                    to: user.email,
                    from: 'yawalkarsry@gmail.com',
                    subject: 'Node.js Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    console.log('mail sent');
                    req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ],
        function (err) {
            if (err) return next(err);
            res.redirect('/forgotPass');
        });
});

router.get('/reset/:token', function (req, res) {
    user.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgotPass');
        }
        res.render('auth/reset', {
            token: req.params.token
        });
    });
});


router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            user.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'yawalkarsry@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'yawalkarsry@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/login');
        }

    });
});

router.get("/appsuggestion",middleware.isMe, async (req, res) => {
    try {
        let users = await user.find();
        res.render("others/seeSuggestions",{users:users})
    }
    catch (error) {
        console.log(error)
    }   
})
router.post("/appsuggestion", async (req, res) => {
    try {
        // let findeduser = await user.findOne({ username: req.user.username });
        let updatedUser = await user.findOneAndUpdate({ username: req.user.username },
            { $push: { suggestion: req.body.suggestion } },
            { new: true, upsert: true }
        );
    
        req.flash("info", " Befit got your Suggestion :)");
       res.redirect('back');

    }
    catch (err) {
        console.log(err)
    }
})

module.exports = router;