var express = require('express'),
    app = express(),
    CONFIG = require("./config.js"),
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

app.use(express.static(CONFIG.static_dir)).listen(CONFIG.static_port);

// https://www.npmjs.com/package/shelljs#exec-command-options-callback
require('shelljs/global');
exec('ls', {silent:true}, function(code, output) {
  console.log('Exit code:', code);
  console.log('Program output:', output);
});

/**
 * globals
 */
var PORT = 9187,
    PORTAPP = 9188,
    DEBUG = false,
    currentPage = {};

app.get("/", function(req, res) {
  res.send('POST/GET SERVER');
});

app.post("/", function(req, res) {
  //TODO:change POST with req.JSON when it's available
  var requestBody = '', message = '';

  req.setEncoding('utf8');

  req.on('data', function (chunk) {
    requestBody += chunk;
  });

  req.on('end', function () {
    try {

      message = JSON.parse(requestBody);
      io.sockets.in('statistics').emit('log', message);
      console.log(message);
      res.sendStatus(200);
    } catch(e){

      console.log("JSON FAIL");
      res.sendStatus(401)

    }
  });

});

app.get(/^(.+)$/, function(req, res){
  console.log('static file request : ' + req.params);
  res.sendfile( __dirname + req.params[0]);
});

app.listen (PORTAPP, function() {
  console.log("listening port for http", PORTAPP);
});

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
