define(function (require) {

    var $ = require('jquery');

    var configWall = function () {
        var self = this;
        //self.test = 'test';

        $("#main-form").submit(function (event) {
            event.stopPropagation();
            event.preventDefault();

            var formData = new FormData();
            formData.append('file', $('#fileinput').files);
            var file = $('#fileinput');

            $.ajax({
                    async: true,
                    cache: false,
                    contentType: file.type,
                    method: 'POST',
                    url: 'api/upload_apk',
                    data: file
                })
                .done(function (data) {
                    console.log("Done Uploading " + data);
                });
        });
    };

    return new configWall();
});