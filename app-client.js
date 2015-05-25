var BSClient = require('./modules/BSClient.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var ws = null, bingo = null;

function connect() {
    ws = new WebSocket(config.websocket.url, config.websocket.protocols);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
}

function onOpen (event) {
    bingo = new BSClient(ws);
    console.log(event);
};
function onMessage (event) {
    bingo.onMessage(event.data);
    console.log(event);
}
function onClose(event) {
    window.setTimeout(connect, 500);
    console.log(event);
}

connect();