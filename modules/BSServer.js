var BSMessage = require('./BSMessage');

function BSServer(bus) {
    this.bus = bus;
    this.games = {};
    this.players = {};
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
            this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', msg.sender, this.toString()));
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

        case 'joinGame':
            this.games[msg.data.game_id].players.push(this.players[msg.sender]);
            break;

        case 'addWord':
            var words = this.games[msg.data.game_id].words;
            var found = false;
            for(var i = 0; i < words.length; i++) {
                if(words[i].word === msg.data.word) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                this.games[msg.data.game_id].words.push({word: msg.data.word, user: this.players[msg.sender]});
            }
            break;

        case 'removeWord':
            // TODO: Fix me
            var words = this.games[msg.data.game_id].words;
            for(var i = 0; i < words.length; i++) {
                if(words[i].word === msg.data.word) {
                    this.games[msg.data.game_id].words = words.slice(i, 1);
                    break;
                }
            }
            break;

        default:
            console.warn('BSServer.onEvent(msg): unknown name: ' + msg.name);
            return false;
            break;
    }

    this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', null, this.toString()));
};
BSServer.prototype.onData = function(msg) {
    return false;
};

BSServer.prototype.toString = function() {
    var games = [];
    for (var key in this.games) {
        if( this.games.hasOwnProperty(key) ) {
            games.push(this.games[key]);
        }
    }

    return {
        games: games,
        last_words: this.last_words
    };
};

BSServer.prototype.addPlayer = function(user) {
    this.players[user.id] = user;
};
BSServer.prototype.removePlayer = function(user) {
    delete this.players[user.id];
};

module.exports = BSServer;