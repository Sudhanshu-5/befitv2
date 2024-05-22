const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), "Asia/Calcutta");
var mongoose = require("mongoose");
var mealDataSchema = new mongoose.Schema({


    foodItems: {
        type: [String],
        default: "-"
    },
    qty: {
        type: [Number],
        default: 0
    },
    servingUnit: {
        type: [String],
        default: "-"
    },
    servingWeight: {
        type: [Number],
        default: 0
    },
    calories: {
        type: [Number],
        default: 0
    },
    fats: {
        type: [Number],
        default: 0
    },
    carbs: {
        type: [Number],
        default: 0
    },
    protiens: {
        type: [Number],
        default: 0
    },
    cholestrol: {
        type: [Number],
        default: 0
    },
    fibres: {
        type: [Number],
        default: 0
    },
    calorieConsumption: {
        type: String,
        default: "Not Added"
    },
    sumPro: {
        type: Number,
        default: 0
    },
    sumCarbs: {
        type: Number,
        default: 0
    },
    sumFats: {
        type: Number,
        default: 0
    },
    label: {
        type: String,
        default: 'Not Added'
    },
    description: {
        type: String,
        default: 'Not Added'
    }
    // },
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }
}, {
    timestamps: true
});
module.exports = mongoose.model("mealinfo", mealDataSchema);