var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    psi = require('psi'),
    WebPageTest = require('webpagetest'),
    wpt = new WebPageTest('www.webpagetest.org', 'A.559d4ae5af277d98b7ba0857515714cd');

/**
 * globals
 */
var PORT = 9187,
    DEBUG = false,
    currentPage = {};

/**
 * Init Socket Server
 */
server.listen(PORT, function(){
  console.log('listening port: ' + PORT);
});

/**
 * Socket Events
 */
io.on('connection', function (socket) {
  console.log('hellow');

  /**
   * if isset currentPage send to client
   */
  if(currentPage.url) {
    socket.emit('page', currentPage);
  }

  /**
   * Log messages to statistics room
   */
  socket.on('log', function (data) {
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
    socket.broadcast.emit('page', currentPage);

    //request page speed
    //startPSI(data, socket);
    startWPT(data, socket);
  });

  socket.on('reset', function(data){
    currentPage = {};
    socket.broadcast.emit('reset', data);
  });
});

function _debug(data) {
  if(DEBUG == true) {
    console.log(data);
  }
}
/*
function startPSI(data, socket) {
  psi(data.url, function (err, psidata) {
    io.sockets.in('statistics').emit('pagespeed', psidata);
  });
}
*/
function startWPT(data, socket){

  var url = data.url;
  delete(data.url);

  wpt.runTest(url, data, function callback(err, wptdata) {

    if (wptdata.statusCode != 200) {
      return;
    }

    socket.emit('wpt', wptdata.data);

    console.log('WPT status:', err || wptdata);
  });
}