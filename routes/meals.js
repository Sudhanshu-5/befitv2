var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var axios = require("axios");
var maletheuser = require("../models/maleUser");
var mealinfo = require("../models/mealInfo");
var calorieinfo = require("../models/calorieInfo");
var userfood = require("../models/userFood");
const femaleUser = require("../models/femaleUser");
var macronutrientinfo = require("../models/macroNutrientInfo");

const middlewareObj = require("../middleware");
const { json } = require("body-parser");
const { findByIdAndUpdate, findOneAndUpdate } = require("../models/maleUser");
const mealInfo = require("../models/mealInfo");

var userType;
var gender = "";
router.use(function (req, res, next) {
  if (req.user) {
    gender = req.user.gender;
    if (gender === "male") {
      userType = maletheuser;
    }
    if (gender === "female") {
      userType = femaleUser;
    }
  }
  next();
});
var dateNow = new Date(Date.now()); //IST time
// console.log("dateNow" + dateNow)

//!addMeal for particular user

router.get("/addMeal", middleware.isLoggedIn, async (req, res) => {
  try {
    var findedUser = await userType
      .findOne({
        username: req.user.username,
      })
      .populate("userfood");
    res.render("meal/addMeal", {
      findedUser: findedUser,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/addMeal", middleware.isLoggedIn, function (req, res) {
  var info = ""; //description
  var label = "";

  //USER food info array
  var uCalsum = 0;
  var uProsum = 0;
  var uCarbsum = 0;
  var uFatsum = 0;
  var ufooditems = [];
  var uqty = [];
  var uservingUnit = [];
  var uservingWeight = [];
  var ucalorie = [];
  var ufats = [];
  var ucarbs = [];
  var uprotiens = [];
  var ucholestrol = [];
  var ufibres = [];

  if (req.body.myfoodsName) {
    let userFood = req.body.myfoodsName;
    let myfoodsqty = req.body.myfoodsQty.map(Number);
    let myfoodsmeasure = req.body.myfoodsMeasure;
    let myfoodsWeight = req.body.myfoodsWeight.map(Number);

    for (let i = 0; i < userFood.length; i++) {
      userFood[i] = userFood[i].trim();
      userfood.findOne(
        {
          food_name: userFood[i],
        },
        function (err, food) {
          if (err) {
            console.log(err);
          } else {
            triggered(food);
          }
        }
      );

      function triggered(food) {
        let factor; //for particular weight

        for (let i = 0; i < myfoodsmeasure.length; i++) {
          for (let j = 0; j < food.serving_unit.length; j++) {
            if (food.serving_unit[j] === myfoodsmeasure[i]) {
              // console.log("permitted")
              factor = myfoodsWeight[i] / food.serving_weight[j];
              // console.log("factor" + factor)
            }
          }
        }

        uCalsum = uCalsum + food.calories * factor;

        ufooditems.push(food.food_name);
        uqty.push(myfoodsqty[i]);
        uservingUnit.push(myfoodsmeasure[i]);
        uservingWeight.push(myfoodsWeight[i]);
        ucalorie.push(food.calories * factor);
        ufats.push(food.fats * factor);
        uFatsum += food.fats * factor;

        ucarbs.push(food.carbs * factor);
        uCarbsum += food.carbs * factor;

        uprotiens.push(food.protiens * factor);
        uProsum += food.protiens * factor;
        ucholestrol.push(food.cholestrol * factor);
        ufibres.push(food.fibres * factor);
      }
    }
  }
  var caloriesSum = 0;
  var calsum = 0;
  var proSum = 0;
  var carbSum = 0;
  var fatSum = 0;
  var fooditems = [];
  var qty = [];
  var servingUnit = [];
  var servingWeight = [];
  var calorie = [];
  var fats = [];
  var carbs = [];
  var protiens = [];
  var cholestrol = [];
  var fibres = [];
  var consumedAt = [];
  //instant path
  if (req.body.labelInstant) {
    if (req.body.nixItemId) {
      // console.log("branded");
      label = req.body.labelInstant;
      // console.log("info" + info + label);
      axios({
        method: "get",
        url:
          "https://trackapi.nutritionix.com/v2/search/item?nix_item_id=" +
          req.body.nixItemId,
        headers: {
          "x-app-id": "4b34a3d8",
          "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
          "x-remote-user-id": "0",
        },
      })
        .then(function (response) {
          calsum = calsum + response.data["foods"][0].nf_calories;
          fooditems.push(response.data["foods"][0].food_name);

          servingWeight.push(response.data["foods"][0].serving_weight_grams);
          calorie.push(response.data["foods"][0].nf_calories);
          fats.push(response.data["foods"][0].nf_total_fat);
          fatSum += response.data["foods"][0].nf_total_fat;
          carbs.push(response.data["foods"][0].nf_total_carbohydrate);
          carbSum += response.data["foods"][0].nf_total_carbohydrate;
          protiens.push(response.data["foods"][0].nf_protein);
          proSum += response.data["foods"][0].nf_protein;
          cholestrol.push(response.data["foods"][0].nf_cholesterol);
          fibres.push(response.data["foods"][0].nf_dietary_fiber);
          servingUnit.push(req.body.measure);
          qty.push(req.body.qty);
        })
        .catch(function (error) {
          if (!fooditems.length && req.body.labelInstant) {
            req.flash("error", "add ur meal with correct spellings");
            res.redirect("back");
          }
        })
        .finally(function () {
          demo();
        });
    } else {
      info = req.body.qty * req.body.weight + "g" + " " + req.body.food;
      label = req.body.labelInstant;
      hitNaturalNutri(info);
    }
  }
  //descriptive path
  else if (req.body.labelDescription) {
    info = req.body.query;
    label = req.body.labelDescription;

    if (!info) {
      req.flash("error", "add something ");
      res.redirect("back");
    } else {
      hitNaturalNutri(info);
    }
  }

  function hitNaturalNutri(info) {
    axios({
      method: "post",
      url: " https://trackapi.nutritionix.com/v2/natural/nutrients",
      headers: {
        "x-app-id": "4b34a3d8",
        "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
        "x-remote-user-id": "0",
      },
      data: {
        query: info,
        timezone: "Asia/Calcutta",
      },
    })
      .then(function (response) {
        for (var i = 0; i < response.data["foods"].length; i++) {
          calsum = calsum + response.data["foods"][i].nf_calories;
          fooditems.push(response.data["foods"][i].food_name);
          servingWeight.push(response.data["foods"][i].serving_weight_grams);
          calorie.push(response.data["foods"][i].nf_calories);
          fats.push(response.data["foods"][i].nf_total_fat);
          fatSum += response.data["foods"][i].nf_total_fat;
          carbs.push(response.data["foods"][i].nf_total_carbohydrate);
          carbSum += response.data["foods"][i].nf_total_carbohydrate;
          protiens.push(response.data["foods"][i].nf_protein);
          proSum += response.data["foods"][i].nf_protein;
          cholestrol.push(response.data["foods"][i].nf_cholesterol);
          fibres.push(response.data["foods"][i].nf_dietary_fiber);
          servingUnit.push(response.data["foods"][i].serving_unit);
          qty.push(response.data["foods"][i].serving_qty);
        }
      })
      .catch(function (error) {
        if (!fooditems.length) {
          req.flash(
            "error",
            "Food Cannot be found in our database. Add in custom foods"
          );
          res.redirect("back");
        }
      })
      .finally(function () {
        demo();
      });
  }

  function demo() {
    // console.log("inside demo with " + fooditems.length);
    caloriesSum = calsum + uCalsum;

    fatSum = fatSum + uFatsum;
    carbSum = carbSum + uCarbsum;
    proSum = proSum + uProsum;

    fooditems = fooditems.concat(ufooditems);
    qty = qty.concat(uqty);
    servingUnit = servingUnit.concat(uservingUnit);
    servingWeight = servingWeight.concat(uservingWeight);
    calorie = calorie.concat(ucalorie);
    fats = fats.concat(ufats);
    carbs = carbs.concat(ucarbs);
    protiens = protiens.concat(uprotiens);
    cholestrol = cholestrol.concat(ucholestrol);
    fibres = fibres.concat(ufibres);

    if (fooditems.length) {
      var data = {
        calorieConsumption: caloriesSum.toFixed(2),
        sumPro: proSum.toFixed(2),
        sumCarbs: carbSum.toFixed(2),
        sumFats: fatSum.toFixed(2),
        label: label,
        description: info,
        foodItems: fooditems,
        qty: qty,
        servingUnit: servingUnit,
        servingWeight: servingWeight,
        calories: calorie,
        cholestrol: cholestrol,
        fats: fats,
        carbs: carbs,
        protiens: protiens,
        fibres: fibres,
      };
      //!create meal info
      mealinfo.create(data, function (err, data) {
        if (err) {
          console.log("error" + err);
        } else {
          //console.log("mealinfo" + data);
          //!push and save meal info to user model
          userType.findOne(
            {
              username: req.user.username,
            },
            function (err, findedUser) {
              if (err) {
                console.log(err);
              } else {
                findedUser.mealinfo.push(data);
                findedUser.save(function (err, addedData) {
                  if (err) {
                    console.log(err);
                  } else {
                  }
                });
                //! total values
                userType
                  .findOne({
                    username: req.user.username,
                  })
                  .populate("mealinfo")
                  .populate("macroNutrientInfo")
                  .exec(function (err, foodinfo) {
                    if (err) {
                      console.log(err);
                    } else {
                      var totalCalorie = parseFloat(data.calorieConsumption); //from body
                      var totalProtiens = data.sumPro;
                      var totalFats = data.sumFats;
                      var totalCarbs = data.sumCarbs;

                      if (foodinfo.macroNutrientInfo.length > 0) {
                        foodinfo.mealinfo.forEach(function (info) {
                          if (
                            new Date(info.createdAt)
                              .toLocaleDateString()
                              .localeCompare(dateNow.toLocaleDateString()) == 0
                          ) {
                            totalCalorie += parseFloat(info.calorieConsumption);
                            totalCarbs += info.sumCarbs;
                            totalFats += info.sumFats;
                            totalProtiens += info.sumPro;
                          }
                        });
                      }

                      // console.log("totslcalore= " + totalCalorie);
                      // console.log("totalFAts:" + totalFats);
                      // console.log("totalPro:" + totalProtiens);
                      // console.log("totalCarbs:" + totalCarbs);
                      macronutrientinfo.findOneAndUpdate(
                        {
                          date: dateNow.toLocaleDateString(),
                          username: req.user.username,
                        },
                        {
                          totalCaloriesConsumed: totalCalorie,
                          total_carbs: totalCarbs,
                          total_fats: totalFats,
                          total_pro: totalProtiens,
                        },
                        {
                          new: true,
                          upsert: true, // Make this update into an upsert
                        },
                        function (err, updatedCalorieInfo) {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log("totslcalore= " + totalCalorie);
                            console.log("totalFAts:" + totalFats);
                            console.log("totalPro:" + totalProtiens);
                            console.log("totalCarbs:" + totalCarbs);
                            //if (foodinfo.macronutrientinfo) {
                            let count = 0;
                            if (foodinfo.macroNutrientInfo.length == 0) {
                              foodinfo.macroNutrientInfo.push(
                                updatedCalorieInfo
                              );
                              foodinfo.save(function (err, saved) {
                                if (err) {
                                  console.log(err);
                                } else {
                                  // console.log(saved);
                                }
                              });
                            } else {
                              foodinfo.macroNutrientInfo.forEach(function (
                                info
                              ) {
                                if (
                                  info.createdAt.toLocaleDateString() ==
                                  updatedCalorieInfo.createdAt.toLocaleDateString()
                                ) {
                                  count++;
                                }
                              });
                              if (count == 0) {
                                foodinfo.macroNutrientInfo.push(
                                  updatedCalorieInfo
                                );
                                foodinfo.save(function (err, saved) {
                                  if (err) {
                                    console.log(err);
                                  } else {
                                    // console.log(saved);
                                  }
                                });
                              }
                            }
                          }
                        }
                      );
                    }
                  });
              }
            }
          );

          //console.log("data:" + data);
          if (fooditems.length) {
            req.flash("info", "Meal is added to ur  diary");
            res.redirect("back");
          }
        }
      });
    } //end if(fooditem
  }
});

//!delete Meal route
router.delete("/deleteMeal", middleware.isLoggedIn, async (req, res) => {
  let millisecondsOfItemsToBeRemoved = req.query.millisecondsOfItemsToBeRemoved;
  let indexOfItemsToBeRemoved = req.query.indexOfItemsToBeRemoved;
  let index = parseInt(indexOfItemsToBeRemoved);
  let findedMealId;
  let findMacroDoc;
  let date = new Date(
    parseInt(millisecondsOfItemsToBeRemoved)
  ).toLocaleDateString();
  //console.log(date)

  //populate mealinfo

  let findedMeal = await userType
    .findOne({
      username: req.user.username,
    })
    .populate("mealinfo");
  //get macronutrientdoc
  try {
    findMacroDoc = await macronutrientinfo.findOne({
      username: req.user.username,
      date: date,
    });
    console.log("findedMacro " + findMacroDoc);
  } catch (err) {
    console.log(err);
  }

  function updateMacronutrientInfo(i) {
    macronutrientinfo.findOneAndUpdate(
      {
        username: req.user.username,
        date: dateNow.toLocaleDateString(),
      },
      {
        totalCaloriesConsumed:
          findMacroDoc.totalCaloriesConsumed -
          findedMeal.mealinfo[i].calories[index],
        total_carbs: (
          findMacroDoc.total_carbs - findedMeal.mealinfo[i].carbs[index]
        ).toFixed(2),
        total_fats: (
          findMacroDoc.total_fats - findedMeal.mealinfo[i].fats[index]
        ).toFixed(2),
        total_pro: (
          findMacroDoc.total_pro - findedMeal.mealinfo[i].protiens[index]
        ).toFixed(2),
      },
      {
        new: true,
      },
      function (err, updatedMacronutrient) {
        if (err) {
          console.log(err);
        } else {
          // console.log("updatedMacroNutrientInfo " + updatedMacronutrient);
        }
      }
    );
  }

  for (let i = 0; i < findedMeal.mealinfo.length; i++) {
    //get document of provided millisecond to manipulate
    if (
      JSON.stringify(new Date(findedMeal.mealinfo[i].createdAt).getTime()) ===
      millisecondsOfItemsToBeRemoved
    ) {
      findedMealId = findedMeal.mealinfo[i]._id;

      if (findedMeal.mealinfo[i].foodItems.length === 1) {
        //update maconutirentinfo
        //delete
        //show targets
        updateMacronutrientInfo(i);
        let deleteDoc = await mealinfo.findByIdAndDelete(findedMealId);
        res.send(millisecondsOfItemsToBeRemoved); //to change update progress bars
      } else {
        s;

        updateMacronutrientInfo(i);
        mealinfo.findByIdAndUpdate(
          findedMealId,
          {
            calorieConsumption: (
              findedMeal.mealinfo[i].calorieConsumption -
              findedMeal.mealinfo[i].calories[index]
            ).toFixed(2),
            sumPro: (
              findedMeal.mealinfo[i].sumPro -
              findedMeal.mealinfo[i].protiens[index]
            ).toFixed(2),
            sumCarbs: (
              findedMeal.mealinfo[i].sumCarbs -
              findedMeal.mealinfo[i].carbs[index]
            ).toFixed(2),
            sumFats: (
              findedMeal.mealinfo[i].sumFats -
              findedMeal.mealinfo[i].fats[index]
            ).toFixed(2),
          },
          {
            new: true,
          },
          function (err, updatedMealInfo) {
            if (err) {
              console.log(err);
            } else {
              var foodIndex = `foodItems.${index}`;
              var qtyIndex = `qty.${index}`;
              var servingUnitIndex = `servingUnit.${index}`;
              var servingWeightIndex = `servingWeight.${index}`;
              var caloriesIndex = `calories.${index}`;
              var fatsindex = `fats.${index}`;
              var carbsIndex = `carbs.${index}`;
              var protiensIndex = `protiens.${index}`;
              var cholestrolIndex = `cholestrol.${index}`;
              var fibresIndex = `fibres.${index}`;
              mealInfo.findByIdAndUpdate(
                findedMealId,
                {
                  $unset: {
                    [foodIndex]: 1,
                    [qtyIndex]: 1,
                    [servingUnitIndex]: 1,
                    [servingWeightIndex]: 1,
                    [caloriesIndex]: 1,
                    [fatsindex]: 1,
                    [carbsIndex]: 1,
                    [protiensIndex]: 1,
                    [cholestrolIndex]: 1,
                    [fibresIndex]: 1,
                  },
                },
                function (err, updatedMealinfo) {
                  if (err) {
                    console.log(err);
                  } else {
                    // console.log("updated " + updatedMealinfo)
                  }
                }
              );
            }
          }
        );
        res.send(millisecondsOfItemsToBeRemoved);
      }
    }
  }
});

//!manage diary
router.get("/diary", middleware.isLoggedIn, async (req, res) => {
  try {
    var findedUser = await userType
      .findOne({
        username: req.user.username,
      })
      .populate("mealinfo");

    res.render("meal/mealDiary", {
      findedUser: findedUser,
    });
  } catch (err) {
    console.log(err);
  }
});

//!Custom foods
router.get("/customFoods", middleware.isLoggedIn, function (req, res) {
  userType
    .findOne({
      username: req.user.username,
    })
    .populate("userfood")
    .exec(function (err, populated) {
      if (err) {
        console.log(err);
      } else {
        //console.log("populated" + populated);
        // console.log("kitchen logs" + populated)
        res.render("meal/userfoods", {
          myfoods: populated,
        });
      }
    });
});
router.post("/customFoods", middleware.isLoggedIn, function (req, res) {
  let unit_array = [];
  let qty_array = [];
  let weight_array = [];
  for (let i = 0; i < req.body.qty.length; i++) {
    qty_array[i] = req.body.qty[i];
    weight_array[i] = req.body.serving_weight[i];
    unit_array[i] = req.body.serving_unit[i];
  }
  let completeObj = req.body.info;
  completeObj["qty"] = qty_array;
  completeObj["serving_unit"] = unit_array;
  completeObj["serving_weight"] = weight_array;
  userfood.create(completeObj, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      // console.log("info" + info);
      userType.findOne(
        {
          username: req.user.username,
        },
        function (err, finded) {
          finded.userfood.push(info);
          finded.save(function (err, saved) {
            if (err) {
              console.log(err);
            } else {
              // console.log(saved);
              req.flash("info", " custom food added");
              res.redirect("back");
            }
          });
        }
      );
    }
  });
});

// !nutritional label

router.get("/Nutritional label", middleware.isLoggedIn, function (req, res) {
  res.render("meal/instantSearchFood");
});

//!instant searcch for food
router.get("/searchInstant", middleware.isLoggedIn, function (req, res) {
  res.render("meal/instantSearchFood");
});
router.get("/searchFood", middleware.isLoggedIn, function (req, res) {
  // console.log(req.query.query);
  var url =
    " https://trackapi.nutritionix.com/v2/search/instant?query=" +
    req.query.query +
    "&detailed=true";
  axios({
    method: "get",
    url: url,
    headers: {
      "content-type": "text/json",
      "Content-Type": "application/json",
      "x-app-id": "4b34a3d8",
      "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
      "x-remote-user-id": "0",
    },
  })
    .then(function (response) {
      //res.send(response.data);
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {});
});

router.post("/searchNutrients", middleware.isLoggedIn, function (req, res) {
  var info = req.body.query;
  var type = req.body.id; //common/breanded
  if (type) {
    axios({
      method: "get",
      url:
        "https://trackapi.nutritionix.com/v2/search/item?nix_item_id=" +
        req.body.id,
      headers: {
        "x-app-id": "4b34a3d8",
        "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
        "x-remote-user-id": "0",
      },
    })
      .then(function (response) {
        var temp = response.data["foods"][0];
        // console.log(temp);
        // console.log(JSON.stringify(temp))
        // var a = {
        //     food: temp.food_name,
        //     total_fat: temp.nf_total_fat,
        //     saturated_fat: temp.nf_saturated_fat,
        //     cholestrol: temp.nf_cholesterol,
        //     carbs: temp.nf_total_carbohydrate,
        //     fiber: temp.nf_dietary_fiber,
        //     sugar: temp.nf_sugars,
        //     protiens: temp.nf_protein,
        // }
        //console.log(a);
        // console.log(JSON.stringify(temp))
        res.render("meal/nutritionalFacts", {
          data: temp,
        });
      })
      .catch(function (error) {
        res.send(error);
        console.log(error);
      })
      .finally(function () {});
  } else {
    axios({
      method: "post",
      url: " https://trackapi.nutritionix.com/v2/natural/nutrients",
      headers: {
        "x-app-id": "4b34a3d8",
        "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
        "x-remote-user-id": "0",
      },
      data: {
        query: info,
      },
    })
      .then(function (response) {
        var temp = response.data["foods"][0];

        // var a = {
        //     food: temp.food_name,
        //     total_fat: temp.nf_total_fat,
        //     saturated_fat: temp.nf_saturated_fat,
        //     cholestrol: temp.nf_cholesterol,
        //     carbs: temp.nf_total_carbohydrate,
        //     fiber: temp.nf_dietary_fiber,
        //     sugar: temp.nf_sugars,
        //     protiens: temp.nf_protein,
        // }
        //console.log(a);
        res.render("meal/nutritionalFacts", {
          data: temp,
        });
      })
      .catch(function (error) {
        res.send(error.response.status);
      })
      .finally(function () {});
  }
});
module.exports = router;
