define(function (require) {

    var $ = require('jquery');

    var configWall = function () {
        var self = this;
        //self.test = 'test';

        $("#main-form").submit(function (event) {
            event.stopPropagation();
            event.preventDefault();

            var formData = new FormData($(this)[0]);

            $.ajax({
                    async: true,
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    url: 'api/upload_apk'
                })
                .done(function (data) {
                    console.log("Done Uploading " + data);
                });
        });

        return {
            writeOutput: function(data){
                $("#apk-output p").hide()
                            .empty()
                            .html(data)
                            .fadeIn('slow');
            }
        }
    };

    return new configWall();
});