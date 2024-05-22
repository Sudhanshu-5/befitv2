function searchInstant(wanted, unwanted) {


    $("#search").autocomplete({

        source: function (request, response) {

            $.ajax({
                url: "https://trackapi.nutritionix.com/v2/search/instant?query=" + request.term + "&" + wanted + "=true" + "&" + unwanted + "=false",
                dataType: "json",
                type: "get",
                headers: {
                    "x-app-id": "4b34a3d8",
                    "x-app-key": "6943cb151e2c8fb6a042ca0f342347da",
                },
                contentType: "application/json; charset=utf-8",


                // open: function() {
                //     var position = $("#results").position(),
                //         left = position.left, top = position.top;

                //     $("#results > ul").css({left: left + 20 + "px",
                //                             top: top + 4 + "px" });

                // },


                success: function (food_data) {
                    $(".selector").autocomplete({

                    });
                    if (!food_data.common) {
                        if (!food_data.branded.length) {
                            var result = [{
                                label: 'Subject not found --- add food to custom foods',
                                value: response.term
                            }];
                            response(result);
                            $("#addToCustomFoods").show();
                        } else {
                            response($.map(food_data.branded, function (item) {
                                return {
                                    value: item.food_name.replace(/\"/g, ""),
                                    id: item.nix_item_id,
                                    label: item.brand_name_item_name.replace(/\"/g, "")
                                }
                            }))
                        }

                    }
                    if (!food_data.branded) {
                        if (!food_data.common.length) {
                            var result = [{
                                label: 'Subject not found----Try to find it in Branded foods',
                                value: response.term
                            }];
                            response(result);
                            $("#addToCustomFoods").show();
                        } else {
                            response($.map(food_data.common, function (item) {
                                return {
                                    value: item.food_name.replace(/\"/g, "")

                                }


                            }))
                        }

                    }
                },
                error: function (response) {
                },

            });
        },
        appendTo: "#results",
        // change: function(event, ui) {
        // if (ui.item == null) {
        //     $("#search").val("");
        //     $("#search").val("");
        //     $("#search").focus();
        // }
        // },
        open: function () {
            var position = $("#results").position(),
                left = position.left,
                top = position.top;

            $("#results > ul").css({
                top: +0 + "rem"
            });

        },
        minLength: 1,

        select: function (event, ui) {
            if (ui.item.label === "Food not found") {

                $("#search").val('');
                event.preventDefault();
                return false;
            }
            $("#search").on('input', function () { //search is empty instant form is hide
                if ($("#search").val() == "") {
                    $("#instant-select-weight").val("100");
                    $("#qty").val('1')
                    $("#instant-form").hide();
                    $(".user-food .btn").removeClass("add-pulse")
                }
                // alert($("#search").val());
            })
            nix_item_id = ui.item.id;
            $("#nix-item-id").val(nix_item_id)
            $("#search").val(ui.item.value);
            $("#instant-form").show();
            return false;
        },
        response: function (event, ui) {
            if ($("#id").css("display")) {
                $("#message").text("No results found");
            } else {
                $("#message").empty();
            }
        }
    });
}