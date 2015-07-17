var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var psi = require('psi');

/**
 * Socket Port
 * @type {number}
 */
var PORT = 9187;

server.listen(PORT, function(){
  console.log('listening post: ' + PORT);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

  socket.emit('connected', { message: 'hello new client!' });

  socket.on('message', function (data) {
    console.log(data);
    socket.emit('message', { message: 'thx for your data' });
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

function startPSI(data, socket) {
  psi(data.url, function (err, data) {
    io.sockets.in('statistics').emit('pageSpeed', data);
  });
}