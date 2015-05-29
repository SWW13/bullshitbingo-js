var BSClient = require('./modules/BSClient.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var ws = null, bingo = null;
var content = document.getElementById('content');
var leaveGame = document.getElementById('menu-logo').addEventListener('click', function (event) {
    if (bingo !== null) {
        bingo.leaveGame(event);
    }
});
var sendMessage = document.getElementById('chat-form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (bingo !== null) {
        bingo.sendMessage(event);
    }
});

function connect() {
    content.innerHTML = templates['connecting'].render({});
    ws = new WebSocket(config.websocket.url, config.websocket.protocols);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
}

function onOpen(event) {
    bingo = new BSClient(ws);
    console.log(event);
};
function onMessage(event) {
    bingo.onMessage(event.data);
    console.log(event);
}
function onClose(event) {
    bingo = null;
    content.innerHTML = templates['connecting'].render({error: event});
    window.setTimeout(connect, 500);
    console.log(event);
}

connect();