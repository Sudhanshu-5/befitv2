const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");
const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thrusday",
    "Friday",
    "Saturday"
]
var mongoose = require("mongoose");
var exerciseSchema = new mongoose.Schema({

    caloriesBurnedPerExercise: {
        type: [Number],
    },
    day: {
        type: String,
        default: weekday[new Date(dateIndia).getDay()]
    },
    duration: {
        type: [Number],

    },

    exerciseName: {
        type: [String],
        default: 'Not Added'
    },
    met: {
        type: [Number],

    },
    // morning/ evening
    session: {
        type: String,
        default: 'Not Added'
    },
    totalCaloriesBurned: {
        type: Number,

    },
    time: String

}, {
    timestamps: true
});
module.exports = mongoose.model("exerciseinfo", exerciseSchema);