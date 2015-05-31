var BSClient = require('./modules/BSClient.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var ws = null, bingo = null;
var content = document.getElementById('content');
document.getElementById('menu-logo').addEventListener('click', function (event) {
    if (bingo !== null) {
        bingo.leaveGame(event);
    }
});
document.addEventListener('scroll', function (event) {
    if (bingo !== null) {
        bingo.renderNavbar();
    }
});
document.getElementById('chat-form').addEventListener('submit', function (event) {
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
};
function onMessage(event) {
    bingo.onMessage(event.data);
}
function onClose(event) {
    bingo = null;
    content.innerHTML = templates['connecting'].render({error: event});
    window.setTimeout(connect, 5000);
}

connect();