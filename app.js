var domain = require('domain');
var config = require('config');
var ws = require('ws');
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
    setInterval(function () {
        bingo.cleanup();
    }, 15 * 60 * 1000);

    // websocket
    var websocket_config = config.get('websocket');
    var server = new ws.Server({ host: websocket_config.hostname, port: websocket_config.port });
    server.on('error', function onError(error) {
        console.err(error);
    });
    server.on('connection', function connection(conn) {
        console.log('# New connection');
        var user = null, sendEvent = null;

        sendEvent = bus.on('messageSend', function (msg) {
            if (msg.receiver === null || user === null || msg.receiver === user.id) {
                try {
                    conn.send(msg.toString());
                } catch (ex) {
                    console.log('could not send message.');
                    console.dir(ex);
                }
                console.dir(msg);
            }
        });

        conn.on('error', function (error) {
            console.err(error);
        });

        conn.on('message', function (data, flags) {
            var msg = BSMessage.fromString(data);

            console.dir(msg);
            bingo.onMessage(msg);

            if (msg.type === 'data' && msg.name === 'user') {
                var user_old = user;
                var user_new = msg.data;

                if ((user === null || user.id === user_new.id) &&
                    typeof(user_new.id) === "string" &&
                    (msg.name === null || typeof(msg.name) === "string")
                    ) {
                    user = user_new;
                    console.dir(user);
                    bingo.addPlayer(user);

                    if (user_old === null) {
                        bingo.connected(user.id);
                    } else if (user_old.name !== user_new.name) {
                        bingo.nickChanged(user.id, user_old.name, user_new.name);
                    }
                } else {
                    if (user !== null) {
                        bingo.err(user.id, '<b>nice try.</b>');
                    }
                }
            }
        });

        conn.on('close', function (code, reason) {
            console.log('# Connection closed: ' + code + ' - ' + reason);
            if (user !== null) {
                bingo.disconnected(user.id);
            }
            bus.off(sendEvent);
        });
    });
});