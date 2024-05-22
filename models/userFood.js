const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");
var mongoose = require("mongoose");
var userFoodSchema = new mongoose.Schema({
    food_name: String,
    calories: Number,
    protiens: Number,
    carbs: Number,
    fibres: Number,
    fats: Number,
    cholestrol: Number,
    serving_unit: [String],
    qty: [Number],
    serving_weight: [Number]
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }



}, {
    timestamps: true
});
module.exports = mongoose.model("userfood", userFoodSchema);