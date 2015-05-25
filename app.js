var config = require('config');
var ws = require('nodejs-websocket');

var BSBingo = require('./modules/BSBingo.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

// serve public folder
var http_config = config.get('http');
if(http_config !== false) {
    var finalhandler = require('finalhandler');
    var http = require('http');
    var serveStatic = require('serve-static');
    var serve = serveStatic('public', {'index': ['index.html']});
    var http_server = http.createServer(function(req, res){
        var done = finalhandler(req, res)
        serve(req, res, done)
    }).listen(http_config.port, http_config.hostname);
}

// bingo
var user = new BSUser(true);
var bingo = new BSBingo(user);

// websocket
var websocket_config = config.get('websocket');
var server = ws.createServer(function (conn) {
    console.log('New connection');

    conn.on('text', function (msg) {
        var result = bingo.onMessage(msg);

        if(result !== undefined && result instanceof BSMessage) {
            conn.sendText(msg.toString());
        }
    });

    conn.on('close', function (code, reason) {
        console.log('Connection closed');
    });
}).listen(websocket_config.port, websocket_config.hostname);