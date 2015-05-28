var domain = require('domain');
var config = require('config');
var ws = require('nodejs-websocket');
var d = domain.create();

var BSServer = require('./modules/BSServer.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');
var Minibus = require('minibus');

// error handling
d.on('error', function (err) {
    console.error(err);
});

// serve public folder
d.run(function () {
    var http_config = config.get('http');
    if (http_config !== false) {
        var finalhandler = require('finalhandler');
        var http = require('http');
        var serveStatic = require('serve-static');
        var serve = serveStatic('public', {'index': ['index.html']});
        var http_server = http.createServer(function (req, res) {
            var done = finalhandler(req, res)
            serve(req, res, done)
        }).listen(http_config.port, http_config.hostname);
    }
});

// websocket server
d.run(function () {
    // bingo
    var bus = Minibus.create();
    var bingo = new BSServer(bus);

    // cleanup every 15 minutes
    setInterval(function() {
        bingo.cleanup();
    }, 15 * 60 * 1000);

    // websocket
    var websocket_config = config.get('websocket');
    var server = ws.createServer(function (conn) {
        console.log('# New connection');
        var user = null, sendEvent = null;

        conn.on('text', function (data) {
            var msg = BSMessage.fromString(data);

            console.dir(msg);
            bingo.onMessage(msg);

            if (msg.type === 'data' && msg.name === 'user') {
                user = msg.data;
                console.dir(user);
                bingo.addPlayer(user);
            }
        });

        conn.on('close', function (code, reason) {
            console.log('# Connection closed: ' + code + ' - ' + reason);
            if (user !== null) {
                bingo.leaveGame(user.id);
            }
            bus.off(sendEvent);
        });

        sendEvent = bus.on('messageSend', function (msg) {
            if (msg.receiver === null || user === null || msg.receiver === user.id) {
                try {
                    conn.sendText(msg.toString());
                } catch (ex) {
                    console.log('could not send message.');
                    console.dir(ex);
                }
                console.dir(msg);
            }
        });
    }).listen(websocket_config.port, websocket_config.hostname);
});