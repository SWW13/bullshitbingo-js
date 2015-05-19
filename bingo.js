var config = require('config');
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var ws = require('nodejs-websocket');

// serve public folder
var serve = serveStatic('public', {'index': ['index.html']});
var http_config = config.get('http');
var http_server = http.createServer(function(req, res){
    var done = finalhandler(req, res)
    serve(req, res, done)
}).listen(http_config.port, http_config.hostname)

var websocket_config = config.get('websocket');
var server = ws.createServer(function (conn) {
    console.log('New connection')
    conn.on('text', function (str) {
        console.log('Received '+str)
        conn.sendText(str.toUpperCase()+'!!!')
    })
    conn.on('close', function (code, reason) {
        console.log('Connection closed')
    })
}).listen(websocket_config.port, websocket_config.hostname)