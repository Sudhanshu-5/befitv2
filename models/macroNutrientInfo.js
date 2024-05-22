// const moment = require('moment-timezone');
// const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");
var mongoose = require("mongoose");
var macroNutrientInfoSchema = new mongoose.Schema({
    total_pro: {
        type: Number,
        default: 0
    },
    total_carbs: {
        type: Number,
        default: 0
    },
    total_fats:{
        type: Number,
        default: 0
    },

    totalCaloriesConsumed: {
        type: Number,
        default: 0
    },
    totalCaloriesBurned: {
        type: Number,
        default: 0
    },
    date: String,
    username: String

}, {
    timestamps: true
});
module.exports = mongoose.model("macroNutrientInfo", macroNutrientInfoSchema);