var BSClient = require('./modules/BSClient.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var ws = null, bingo = null;
var content = document.getElementById('content');

function connect() {
    content.innerHTML = templates['connecting'].render({});
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
    content.innerHTML = templates['connecting'].render({error: event});
    window.setTimeout(connect, 500);
    console.log(event);
}

connect();