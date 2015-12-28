var CONFIG = require("./config.js");
var express = require('express');
var cors = require('cors');
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
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

/* Multer */
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/api-upload/')
    },
    filename: function (req, file, cb) {
        // in some weird cases, ipa is renamed to zip...
        /*if (file.originalname.substr(file.originalname.length - 3) === "zip"){
            file.originalname = file.originalname.substr(0, file.originalname.length - 4);
        }
        console.log(file.originalname);*/
        cb(null, file.originalname);
    }
});

var upload = multer({storage: storage});
/*--------*/

bitly.setAccessToken(CONFIG.bitly_access_token);

/**
 * CORS Policy definition (Cross-Domain)
 */
app.use(cors());


app.use(express.static(CONFIG.static_dir)).listen(CONFIG.static_port, function () {
    console.log("Serving HTTP from " + CONFIG.static_dir + ":" + CONFIG.static_port);
});

// https://www.npmjs.com/package/shelljs#exec-command-options-callback
require('shelljs/global');

/**
 * globals
 */
var DEBUG = true,
    currentPage = {};

//Save ip on Remote, so any client can look where to connect;
request("http://tn.codiarte.com/public/QA_Wall-Logger_Server-Helper/save_ip.php?localIp=" + ip.address() + "&message_port=" + CONFIG.static_port + "&socket_port=" + CONFIG.socket_port, function (error, response, body) {
    _debug('Codiarte Response: ' + response.statusCode + " " + body);
});

// Method to call the CLI, and output the log
/*
    @param req {Object} the request object from the original request
    @param res {Object} the response object from the original request
    @param message {String} Message for the currently action to pass
        for console.log and emit Messages to View
    @param commandAndroid {String} the CLI command to execute for Android
    @param commandiOs {String} the CLI command to execute for iOs

    @return {Object} the object with status (if everything goes well, 200)
*/
var cliCall = function (req, res, message, commandAndroid, commandiOs) {
    if (req.body.file.apk){
        var messageTemp1 = message + req.body.file.apk;
        console.log(messageTemp1);
        io.sockets.emit('app-config-messages', messageTemp1);
        var apkProcess = exec(commandAndroid + req.body.file.apk, {async:true});
        apkProcess.stdout.on('data', function(data) {
            io.sockets.emit('app-config-messages', data);
        });
    }

    if (req.body.file.ipa){
        if (req.body.file.ipa.substr(req.body.file.ipa.length - 3) === "zip"){
            req.body.file.ipa = req.body.file.ipa.substr(0, req.body.file.ipa.length - 4);
        }

        var messageTemp2 = message + req.body.file.ipa;
        console.log(messageTemp2);
        io.sockets.emit('app-config-messages', messageTemp2);

        var ipaUnzip = exec('unzip -o tmp/api-upload/' + req.body.file.ipa + ' -d tmp/api-upload/', {async:false});

        var ipaProcess = exec(commandiOs + req.body.file.ipa, {async:true});
        ipaProcess.stdout.on('data', function(data) {
            io.sockets.emit('app-config-messages', data);
        });
    }
    res.sendStatus(200);
};


// Upload de archivo e Instalacion
app.post("/api/upload_app", function (req, res, next) {
    console.log("Beginning Upload");

    upload.fields([{ name: 'apk', maxCount: 1 }, { name: 'ipa', maxCount: 1 }])(req, res, function (err) {
        if (err) {
            res.sendStatus(401);
            console.log("Error Uploading - " + err);
            return
        }

        if (req.files.apk){
            console.log("Done Uploading " + req.files.apk[0].filename);
        }
        if (req.files.ipa){
            console.log("Done Uploading " + req.files.ipa[0].filename);
        }

        // Envio 200 con nombre de Archivo
        res.send({status: 200, filename: req.files });
    })
});

// App Install
app.post("/api/install_app", function (req, res, next) {
    cliCall(req,res, 'Instalando : ','python cli/install -i -f tmp/api-upload/', 'cli/iosInstaller.py -i -p tmp/api-upload/');
});

// Launch app
app.post("/api/launch_app", function (req, res, next) {
    cliCall(req,res, 'Lanzando : ','python cli/install -l -f tmp/api-upload/', 'cli/iosInstaller.py -l -p tmp/api-upload/');
});

// Uninstall App
app.post("/api/uninstall_app", function (req, res, next) {
    cliCall(req,res, 'Desinstalando : ','python cli/install -u -f tmp/api-upload/', 'cli/iosInstaller.py -u -p tmp/api-upload/');
});


app.post("/send_message", function (req, res, next) {

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
