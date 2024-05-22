var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var femaleUserSchema = new mongoose.Schema({

    bodyType: String,
    username: String,
    firstName: String,
    lastName: String,
    height: String,
    weight: String,
    DOB: String,
    age: Number,
    bmi: Number,
    bmr: Number,
    activityFactor: Number,
    bodyfat: {
        type: Number,
    },
    neck: {
        type: Number,
    },
    waist: {
        type: Number,

    },
    hip: {
        type: Number,
    },
    inactive_protiensRatio: {
        type: Number,
        default: 30
    },
    inactive_fatsRatio: {
        type: Number,
        default: 20
    },
    inactive_carbsRatio: {
        type: Number,
        default: 50
    },

    med_protiensRatio: {
        type: Number,
        default: 15
    },
    med_fatsRatio: {
        type: Number,
        default: 30
    },
    med_carbsRatio: {
        type: Number,
        default: 55
    },

    high_protiensRatio: {
        type: Number,
        default: 25
    },
    high_fatsRatio: {
        type: Number,
        default: 30
    },
    high_carbsRatio: {
        type: Number,
        default: 45
    },
    p_target: Number, //protien target
    c_target: Number,
    f_target: Number,
    goal: String,
    goal_calories: Number,
    goal_number:Number,

    mealinfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "mealinfo"
    }],
    exerciseinfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "exerciseinfo"
    }],
    userfood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userfood"
    }],
    userexercise: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userexercise"
    }],
    macroNutrientInfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "macroNutrientInfo"
    }],
    ondate: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ondate"
    }]
})
femaleUserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("femaleuser", femaleUserSchema);
