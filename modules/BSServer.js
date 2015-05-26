var BSMessage = require('./BSMessage');
var Utils = require('./Utils.js');

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
            var players = this.games[msg.data.game_id].players;
            var found = false;
            for(var i = 0; i < players.length; i++) {
                if(players[i].id === msg.sender) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                this.games[msg.data.game_id].players.push(this.players[msg.sender]);
            }
            this.updateGame(msg.data.game_id);
            break;

        case 'addWord':
            // add word to game if new
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

            // switch stage if word limit reached
            var game = this.games[msg.data.game_id];
            if(game.words.length === game.width * game.height) {
                this.games[msg.data.game_id].stage = 'bingo';
                this.updateGame(msg.data.game_id);
            }

            // add to last_words if new, cut at 50 words
            found = false;
            for(var i = 0; i < this.last_words.length; i++) {
                if(this.last_words[i].word === msg.data.word) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                this.last_words.push({word: msg.data.word, user: this.players[msg.sender]});
            }
            this.last_words = this.last_words.slice(0, 50);
            break;

        case 'buzzWord':
            // set word active
            var words = this.games[msg.data.game_id].boards[msg.sender];

            for(var i = 0; i < words.length; i++) {
                if(words[i].word === msg.data.word) {
                    this.games[msg.data.game_id].boards[msg.sender][i].active = true;
                }
            }
            break;

        case 'removeWord':
            var words = this.games[msg.data.game_id].words;
            var words_new = [];
            for(var i = 0; i < words.length; i++) {
                if(words[i].word !== msg.data.word) {
                    words_new.push(words[i]);
                }
            }
            this.games[msg.data.game_id].words = words_new;
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

BSServer.prototype.updateGame = function(game_id) {
    var game = this.games[game_id];

    if(game.stage === 'bingo') {
        for(var key in game.players) {
            if(game.players.hasOwnProperty(key)) {
                var player_id = game.players[key].id;

                if(game.boards[player_id] === undefined || game.boards[player_id] === null) {
                    var board = Utils.shuffle(JSON.parse(JSON.stringify(game.words)));

                    for(var i = 0; i < board.length; i++) {
                        board[i].active = false;
                    }

                    this.games[game_id].boards[player_id] = board;
                }
            }
        }
    }
};

BSServer.prototype.addPlayer = function(user) {
    this.players[user.id] = user;
};
BSServer.prototype.removePlayer = function(user) {
    delete this.players[user.id];
};

module.exports = BSServer;