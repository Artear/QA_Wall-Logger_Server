/**
 * Created by dientuki on 16/12/15.
 */

define(function (require) {

  var $ = require('jquery'),
      socket = null,
      configWall = null;
      
  $.getJSON( "http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/get_ip.php", function( data ) {
    socket = require('io').connect(data.localIp + ':9187/');
  }).done(function () {
    socket.on('apk-installing', function (data) {
      configWall.writeOutput(data);
    });
  });      

  $(document).ready(function () {
    configWall = require('configwall');
  });
});
