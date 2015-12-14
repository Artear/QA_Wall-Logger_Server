var CONFIG = require("./config.js");
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var WebPageTest = require('webpagetest');
var wpt = new WebPageTest(CONFIG.wpt_url, CONFIG.wpt_key);
var request = require("request");
var ip = require("ip");
var bitlyAPI = require("node-bitlyapi");
var bitly = new bitlyAPI({
    client_id: CONFIG.bitly_id,
    client_secret: CONFIG.bitly_secret
});

bitly.setAccessToken(CONFIG.bitly_access_token);

app.use(express.static(CONFIG.static_dir)).listen(CONFIG.static_port, function () {
    console.log("Serving HTTP from " + CONFIG.static_dir + ":" + CONFIG.static_port);
});

// https://www.npmjs.com/package/shelljs#exec-command-options-callback
require('shelljs/global');
exec('ls', {silent: true}, function (code, output) {
    console.log('Exit code:', code);
    console.log('Program output:', output);
});

/**
 * globals
 */
var DEBUG = false,
    currentPage = {};

//for codiarte save_ip get
request("http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/save_ip.php?localIp=" + ip.address() + "&port=" + CONFIG.static_port, function (error, response, body) {
    _debug(body);
});

/**
 * CORS Policy definition (Cross-Domain)
 */

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.post("/send_message", function (req, res) {
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
            res.sendStatus(200);
        } catch (e) {

            console.log("JSON FAIL");
            res.sendStatus(401);
        }
    });

});

/**
 * Init Socket Server
 */
server.listen(CONFIG.socket_port, function () {
    console.log('Listening Socket on Port: ' + CONFIG.socket_port);
});

/**
 * Socket Events
 */
io.on('connection', function (socket) {
    /**
     * if isset currentPage send to client
     */
    if (currentPage.url) {
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
    socket.on('join', function (data) {
        socket.join(data.room);
    });

    /**
     * Init Hook
     * Send the init event to apps
     */
    socket.on('page', function (data) {

        //set current page
        currentPage = data;

        //send init hook to Apps
        socket.broadcast.emit('page', currentPage);

        //request page speed
        //startPSI(data, socket);
        startWPT(data, socket);

        var url = 'https://developers.google.com/speed/pagespeed/insights/?url=' + encodeURIComponent(data.url);

        bitly.shorten({longUrl: url}, function (err, results) {
            results = JSON.parse(results);
            socket.emit('bitly.psi', results.data.url);
        });
    });

    socket.on('reset', function (data) {
        currentPage = {};
        socket.broadcast.emit('reset', data);
    });
});

function _debug(data) {
    if (DEBUG == true) {
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
function startWPT(data, socket) {

    var url = data.url;
    delete(data.url);

    wpt.runTest(url, data, function callback(err, wptdata) {

        if (wptdata.statusCode != 200) {
            return;
        }

        socket.emit('wpt', wptdata.data);

        console.log('WPT status:', err || wptdata);

        bitly.shorten({longUrl: wptdata.data.userUrl}, function (err, results) {

            results = JSON.parse(results);
            socket.emit('bitly.wpt', results.data.url);
        });
    });
}
