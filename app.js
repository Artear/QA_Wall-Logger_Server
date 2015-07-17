var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(9187);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

  socket.emit('connected', { message: 'hello new client!' });

  socket.on('message', function (data) {
    console.log(data);
  });

});