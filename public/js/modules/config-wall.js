define(function (require) {

    var $ = require('jquery');

    var configWall = function () {
        var self = this;

        $("#main-form").submit(function (event) {
            event.stopPropagation();
            event.preventDefault();

            // limpio el log, si hubiere uno anterior
            $("#apk-output").hide();
            $("#apk-output code").empty();

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
                console.log("Done Uploading : " + data.filename);
                $("#fileinput").val('')
                $('#main-form').slideUp('slow');
                $('#apk-reinstall-name').html(data.filename);
                $('#apk-reinstall').show();
            });
        });

        $("#apk-reinstall-newfile").on('click',function (event) {
            event.stopPropagation();
            event.preventDefault();
            $("#fileinput").val('')
            $('#main-form').slideDown('slow');
            $('#apk-reinstall-name').html('');
            $('#apk-reinstall').slideUp('slow');
        });

        $("#apk-reinstall-button").on('click',function (event) {
            event.stopPropagation();
            event.preventDefault();
            var value = $('#apk-reinstall-name').html();
            var dataToSend = {
                'file': value
            };

            // limpio el log, si hubiere uno anterior
            $("#apk-output").hide();
            $("#apk-output code").empty();
            
            $.ajax({
                data: dataToSend,
                dataType: 'json',
                type: 'POST',
                url: 'api/reinstall_apk'
            })
            .done(function (data) {
                console.log("Done Uploading : " + data.filename);
            });
        });

        return {
            // Metodo para escribir la salida de lo que ocurrio en la instalacion
            writeOutput: function(data){
                var current = $("#apk-output code").text();
                $("#apk-output code").text( current + ' ' + data );
                $("#apk-output").show();
                            /*.hide()
                            .empty()
                            .html(data)
                            .fadeIn('slow');*/
            }
        }
    };

    return new configWall();
});