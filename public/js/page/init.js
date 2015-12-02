/**
 * Created by franciscok on 17/07/15.
 */

define(function (require) {

    var $ = require('jquery');

    $(document).ready(function () {

        $('#fileinput').on('change', function () {
            var ajax = $.ajax({
                type: 'POST',
                cache: false,
                contentType: false,
                processData: false
            });
        });

        /*if ($("#chart").length > 0) {
            console.log("paso");
            var mesagges = require('am');

        } else */{
            console.log("no paso");
            $("#main-form").on("submit", function (event) {
                chocoWall.submit(event, $(this));
            }).find('.close').on('click', function (event) {
                chocoWall.close(event);
            });


            $("#again").on('click', function (event) {
                chocoWall.changeScreen('#step-1', function () {
                    chocoWall.reset();
                });
            });

            $("#report").on('click', function (event) {
                chocoWall.report($(this));
            });

        }
    });

});
