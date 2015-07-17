var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var psi = require('psi');

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

/**
 * Socket Events
 */
io.on('connection', function (socket) {

  socket.emit('connected', { message: 'hello new client!' });

  socket.on('message', function (data) {
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
  socket.on('init', function(data){

    //request page speed
    startPSI(data, socket);

    //send init hook to Apps
    socket.broadcast.emit('init', data);
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

psi('tn.com.ar', function (err, data) {
  console.log(data);
});