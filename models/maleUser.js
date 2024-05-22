var mongoose = require("mongoose");
var maleUserSchema = new mongoose.Schema({

    username: String,
    firstName: String,
    lastName: String,
    height: String,
    weight: String,
    DOB: String,
    age: Number,
    bmi: {
        type: Number,
        default: 0
    },
    // calorieinfo: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "calorieinfo"
    // }],
    bodyfat: {
        type: Number
    },
    neck: {
        type: Number
    },
    waist: {
        type: Number,

    },
    hip: {
        type: Number,
    },
    bmr: Number,

    activityFactor: Number,

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
    goal: {
        type: String,
        default: ""
    },
    goal_calories:{
        type: Number,
        default: 0
    },
    goal_number:{
        type: Number,   
        default: 0
    },//how much weight to be increase or decrese
    
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

});
module.exports = mongoose.model("maletheuser", maleUserSchema);