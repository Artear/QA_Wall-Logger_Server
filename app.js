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
    startPSI(data, socket);
    //startWPT(data, socket);
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

function startPSI(data, socket) {
  psi(data.url, function (err, psidata) {
    io.sockets.in('statistics').emit('pagespeed', psidata);
  });
}

function startWPT(data, socket){
  
  /*
  data = { runs: '3',
  connectivity: '3G',
  location: 'ec2-sa-east-1:Chrome',
  url: 'http://tn.com.ar' };  
  */
 
  console.log('WPT config', data);
  
  var url = data.url;
  delete(data.url);
  
  wpt.runTest(url, data, function callback(err, wptdata) {
    
    if (wptdata.statusCode != 200) {
      return;
    }
    /*
    (function wptcheck(){
       setTimeout(function(){
        wptdata.data =  {};
        wptdata.data.jsonUrl = 'http://www.webpagetest.org/jsonResult.php?test=150717_XG_13TX';
        
        
        var xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", wptdata.data.jsonUrl, true );        
            xmlHttp.onreadystatechange=function(){
              if( (xmlHttp.readyState==4) && (xmlHttp.status==200)){
                console.log(xmlHttp.responseText);
              }
            };
        
        http.get(, function(res) {
          console.log("Got response: " + res.statusCode);
          for (i in res) {
            console.log(i)
          }
          console.log(res.client)
          
          //console.log(res.content)
          //io.sockets.in('statistics').emit('wpt', res);
          if (wptdata.data.statusCode != 200) {
            console.log('no esta todavia');
            wptcheck();
          } else {
            console.log('le wii~');
            io.sockets.in('statistics').emit('wpt', wptdata);
          }
        }).on('error', function(e) {
          console.log("Got error: " + e.message, e);
        });         
         console.log(wptdata.data);
       }, 1000);
    })();
    */    
    console.log('WPT status:', err || wptdata);
  });
}