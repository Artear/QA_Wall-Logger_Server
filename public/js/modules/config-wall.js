define(function (require) {

    var $ = require('jquery');

    var configWall = function () {
        var self = this;

        // Metodo para enviar comandos a diferentes endpoints
        /* 
            @param {String} endpoint - la ruta a la cual hacer el POST
            @param {Function} callback - callback que se ejecuta luego del DONE del POST
        */
        var sendCommands = function(endpoint,callback){
            event.stopPropagation();
            event.preventDefault();
            var value = {};
            if ($('#apk-install-name').html() != ''){
                value.apk = $('#apk-install-name').html();
            }

            if ($('#ipa-install-name').html() != ''){
                value.ipa = $('#ipa-install-name').html();
            }

            var dataToSend = {
                'file': value
            };

            // limpio el log, si hubiere uno anterior
            $("#app-output").hide();
            $("#app-output code").empty();
            
            $.ajax({
                data: dataToSend,
                dataType: 'json',
                type: 'POST',
                url: endpoint
            })
            .done(function (data) {
                //console.log("Done Uploading : " + data.filename);
                callback(data);
            });
        };

        // Registro los eventos de click
        var attachEvents = function() {
            $("#main-form").submit(function (event) {
                event.stopPropagation();
                event.preventDefault();

                // limpio el log, si hubiere uno anterior
                $("#app-output").hide();
                $("#app-output code").empty();

                var formData = new FormData($(this)[0]);

                $.ajax({
                    async: true,
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    url: 'api/upload_app'
                })
                .done(function (data) {
                    console.log("Done Uploading : " + JSON.stringify(data.filename));
                    $("#fileinput").val('')
                    $('#main-form').slideUp('slow');

                    if (data.filename.apk){
                        $('#apk-install-name').html(data.filename.apk[0].filename);
                    }
                    if (data.filename.ipa){
                        $('#ipa-install-name').html(data.filename.ipa[0].filename);
                    }
                    $('#app-install').show();
                });
            });

            $("#app-install-newfile").on('click',function (event) {
                event.stopPropagation();
                event.preventDefault();
                $("#fileinput").val('')
                $('#main-form').slideDown('slow');

                $('#apk-install-name').html('');
                $('#ipa-install-name').html('');

                $('#app-install').slideUp('slow');

                // limpio el log, si hubiere uno anterior
                $("#app-output").hide();
                $("#app-output code").empty();
            });

            $("#app-install-button").on('click',function (event) {
                sendCommands('api/install_app', function(data){
                    console.log("Done Uploading : " + data);
                });
            });

            $("#app-launch-button").on('click',function (event) {
                sendCommands('api/launch_app', function(data){
                    console.log("Done Uploading : " + data);
                });
            });
        }();

        return {
            // Metodo para escribir la salida de lo que ocurrio en la instalacion
            writeOutput: function(data){
                var current = $("#app-output code").text();
                $("#app-output code").text( current + ' ' + data );
                $("#app-output").show();
            }
        }
    };

    return new configWall();
});