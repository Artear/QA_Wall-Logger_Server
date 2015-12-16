/**
 * Created by franciscok on 17/07/15.
 */

define(function (require) {

    var $ = require('jquery');
    var cw = require('cw');

    $(document).ready(function () {

        $("#main-form").on("submit", function (event) {
            cw.submit(event, $(this));
        }).find('.close').on('click', function (event) {
            cw.close(event);
        });


        $("#again").on('click', function (event) {
            cw.changeScreen('#step-1', function () {
                cw.reset();
            });
        });

        $("#report").on('click', function (event) {
            cw.report($(this));
        });

    });
});
