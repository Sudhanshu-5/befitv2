var mongoose = require("mongoose");
var onDateschema = new mongoose.Schema({

    date: String,
    bmr: Number,
    weight: Number,
    height: Number,
    neck: Number,
    waist: Number,
    bodyFat: Number,
    activityFactor: Number,
    username: String


}, {
    timestamps: true
});
module.exports = mongoose.model("ondate", onDateschema);