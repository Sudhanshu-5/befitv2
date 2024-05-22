const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");
var mongoose = require("mongoose");
var userExerciseSchema = new mongoose.Schema({
    exercise_name: String,
    burnedcalories: Number,
    met: Number,
    duration: Number
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }

}, {
    timestamps: true
});
module.exports = mongoose.model("userexercise", userExerciseSchema);