var BSBingo = require('./modules/BSBingo.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var user = new BSUser(false);
var bingo = new BSBingo(user);

var ws = new WebSocket(config.websocket.url, config.websocket.protocols);

ws.onopen = function (event) {
    console.dir(event);

    var msg = new BSMessage('action', 'getData', user, null);
    console.dir(msg);
    ws.send(msg);
};
ws.onmessage = function (event) {
    console.dir(event);

    bingo.onMessage(JSON.parse(event.data));
    console.dir(bingo);
}