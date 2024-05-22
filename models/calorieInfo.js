const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");
var mongoose = require("mongoose");
var calorieInfoSchema = new mongoose.Schema({
    totalCaloriesConsumed: {
        type: Number,
        default: 0
    },
    totalCaloriesBurned: {
        type: Number,
        default: 0
    }
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }
}, {
    timestamps: true
});
module.exports = mongoose.model("calorieinfo", calorieInfoSchema);