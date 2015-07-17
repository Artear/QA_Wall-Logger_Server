var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(9187);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

/*
var WebPageTest = require('webpagetest');

var wpt = new WebPageTest('www.webpagetest.org', 'A.559d4ae5af277d98b7ba0857515714cd');

var config = {"connectivity":"3G",
              "location":"Dulles_MotoG:Motorola G - Chrome",
              "runs":"3"};
              
              //login password

wpt.runTest('m.tn.com.ar', config, function callback(err, data) {
  console.log(err || data);
});
*/

io.on('connection', function (socket) {

  socket.emit('connected', { message: 'hello new client!' });

  socket.on('message', function (data) {
    console.log(data);

    socket.emit('message', { message: 'thx for your data' });
  });

});