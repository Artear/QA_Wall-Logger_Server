var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    WebPageTest = require('webpagetest'),
    wpt = new WebPageTest('www.webpagetest.org', 'A.559d4ae5af277d98b7ba0857515714cd'),
    bitlyAPI = require("node-bitlyapi"),
    bitly = new bitlyAPI({
      client_id: "3d4a4e7c2c8cfa6e6d357f93bc83a13220feb899",
      client_secret: "0404717faef381a7d60ad7a0d3aca3ffedbf5373"
    });

bitly.setAccessToken('b8e564b879029ff16c9c08f3b212affbb60f7ec7');

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

    var url = 'https://developers.google.com/speed/pagespeed/insights/?url=' + encodeURIComponent(data.url);

    bitly.shorten({longUrl:url}, function(err, results) {
      results = JSON.parse(results);
      socket.emit('bitly.psi', results.data.url);
    });
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

    bitly.shorten({longUrl:wptdata.data.userUrl}, function(err, results) {

      results = JSON.parse(results);
      socket.emit('bitly.wpt', results.data.url);
    });
  });
}