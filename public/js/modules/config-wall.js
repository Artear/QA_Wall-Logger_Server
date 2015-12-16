define(function (require) {

    var $ = require('jquery'),
        socket = null;

    var app = {};

    /*$.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
        socket = require('io').connect(data.localIp + ':' + data.socket_port +'/');
    }).done(function() {
        socket.on('log', processEvent);
        socket.emit('join', {room: 'statistics'});
    });*/

    var configWall = function(){
        var self = this;
        //self.test = 'test';

        $("#main-form").submit(function(){
            event.stopPropagation();
            event.preventDefault();
            $.ajax({
                async: true,
                cache: false,
                dataType: 'multipart/form-data',
                method: 'POST',
                url: 'api/upload'
                })
            .sucess(function (data) {
                console.log(data);
            });
        });
    };

    app = new configWall();
    return app;

});