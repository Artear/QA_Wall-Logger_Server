var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var psi = require('psi');
var WebPageTest = require('webpagetest');
var wpt = new WebPageTest('www.webpagetest.org', 'A.559d4ae5af277d98b7ba0857515714cd');

/**
 * globals
 */
var PORT = 9187,
    DEBUG = true,
    currentPage = {
      url:'http://tn.com.ar'
    };

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

  /**
   * if isset currentPage send to client
   */
  if(currentPage != null) {
    socket.emit('page', currentPage);
  }

  setInterval(function(){
    socket.emit('test', {message:"hola"});
  }, 5000);

  /**
   * Log messages to statistics room
   */
  socket.on('log', function (data) {
    _debug(data);
    io.sockets.in('statistics').emit('log', data);
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
   
    //set current page
    currentPage = data;

    //send init hook to Apps
    socket.broadcast.emit('page', data);

    //request page speed
    startPSI(data, socket);
    startWPT(data, socket);
    
  });

  socket.on('reset', function(data){
    currentPage = null;
    socket.broadcast.emit('reset', data);
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

function startWPT(data, socket){
  console.log('WPT', data);
  
  var url = data.url;
  delete(data.url);
  
  wpt.runTest(url, data, function callback(err, data) {
    io.sockets.in('statistics').emit('pagespeed', data);
    console.log('WPT:', err || data);
  });
  
}
