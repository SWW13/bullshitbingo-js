var BSMessage = require('./BSMessage');

function BSServer(bus) {
    this.bus = bus;
    this.games = [];
    this.last_words = [];
}

BSServer.prototype.onMessage = function(msg) {
    switch(msg.type) {
        case 'event':
            this.onEvent(msg);
            break;
        case 'action':
            this.onAction(msg);
            break;
        case 'data':
            this.onData(msg);
            break;

        default:
            console.warn('BSServer.onMessage(msg): unknown type: ' + msg.type);
            return false;
            break;
    }
};
BSServer.prototype.onAction = function(msg) {
    switch(msg.name) {
        case 'getData':
            this.bus.emit('messageSend', new BSMessage('data', 'BSServer', 'server', msg.sender, this.toString()));
            break;

        default:
            console.warn('BSServer.onAction(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};
BSServer.prototype.onEvent = function(msg) {
    this.bus.emit('messageSend', new BSMessage('event', msg.name, msg.sender, null, msg.data));

    switch(msg.name) {
        case 'newGame':
            this.games[msg.data.id] = msg.data;
            break;

        default:
            console.warn('BSServer.onEvent(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};
BSServer.prototype.onData = function(msg) {
    return false;
};

BSServer.prototype.toString = function() {
    var games = [];
    for(var i = 0; i < this.games.length; i++){
        games.push(this.games[i].toString);
    }

    var last_words = [];
    for(var i = 0; i < this.last_words.length; i++){
        games.push(this.last_words[i].toString);
    }

    return {
        games: games,
        last_words: last_words
    };
};

module.exports = BSServer;