var BSBingo = require('./modules/BSBingo.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var bus = Minibus.create();
var user = new BSUser(false);
var bingo = new BSBingo(bus, user);

var ws = new WebSocket(config.websocket.url, config.websocket.protocols);
var sendEvent = null;

ws.onopen = function (event) {
    console.dir(event);

    sendEvent = bus.on('messageSend', function(msg){
        ws.send(msg.toString());
    });

    var msg = new BSMessage('action', 'getData', user.id, 'server', 'BSBingo');
    ws.send(msg.toString());
};
ws.onmessage = function (event) {
    console.dir(event);

    bingo.onMessage(event.data);
    console.dir(bingo);
}
ws.onclose = function(event) {
    console.dir(event);

    bus.off(sendEvent);
    alert('TODO: connection broken.');
}