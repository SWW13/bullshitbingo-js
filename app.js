var config = require('config');
var ws = require('nodejs-websocket');

var BSServer = require('./modules/BSServer.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');
var Minibus = require('minibus');

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
var bus = Minibus.create();
var bingo = new BSServer(bus);

// websocket
var websocket_config = config.get('websocket');
var server = ws.createServer(function (conn) {
    console.log('# New connection');
    bus.emit('connectionNew');
    var user = null, sendEvent = null;

    conn.on('text', function (data) {
        var msg = BSMessage.fromString(data);

        console.dir(msg);
        bingo.onMessage(msg);

        if(msg.type === 'data' && msg.name === 'user') {
            user = msg.data;
            console.dir(user);
            bingo.addPlayer(user);
        }
    });

    conn.on('close', function (code, reason) {
        console.log('# Connection closed: ' + code + ' - ' + reason);
        bus.off(sendEvent);

        if(user !== null) {
            bingo.removePlayer(user);
        }
    });

    sendEvent = bus.on('messageSend', function(msg){
        if(msg.receiver === null || user === null || msg.receiver === user.id) {
            conn.sendText(msg.toString());
            console.dir(msg);
        }
    });

    conn.sendText(new BSMessage('action', 'getUser', 'server', null, null).toString());
}).listen(websocket_config.port, websocket_config.hostname);