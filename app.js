var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var psi = require('psi');
var WebPageTest = require('webpagetest');
var wpt = new WebPageTest('www.webpagetest.org', 'A.559d4ae5af277d98b7ba0857515714cd');

/**
 * Socket Port
 * @type {number}
 */
var PORT = 9187;
var DEBUG = true;

/**
 * Init Socket Server
 */
server.listen(PORT, function(){
  console.log('listening port: ' + PORT);
});

/**
 * Root Server
 */
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

/*




var config = {"connectivity":"3G",
              "location":"Dulles_MotoG:Motorola G - Chrome",
              "runs":"3"};
              
              //login password

*/

/**
 * Socket Events
 */
io.on('connection', function (socket) {

  socket.emit('connected', { message: 'hello new client!' });

  socket.on('log', function (data) {
    _debug(data);
    io.sockets.in('statistics').emit('message', data);
  });

  /**
   * Join Room
   */
  socket.on('join', function(data){
    socket.join(data.room);
  });

  /**
   * Init Hook
   * Send the init event to apps
   */
  socket.on('page', function(data){

    //request page speed
    startPSI(data, socket);
    
    startWPT(data);

    //send init hook to Apps
    socket.broadcast.emit('page', data);
  });

});

function _debug(data) {
  if(DEBUG == true) {
    console.log(data);
  }
}

function startPSI(data, socket) {
  psi(data.url, function (err, data) {
    io.sockets.in('statistics').emit('pagespeed', data);
  });
}

function startWPT(data){
  console.log('WPT', data);
  
  var url = data.url;
  delete(data.url);
  
  wpt.runTest(url, data, function callback(err, data) {
    console.log(err || data);
  });
  
}
