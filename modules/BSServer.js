var BSMessage = require('./BSMessage');
var Utils = require('./Utils.js');

function BSServer(bus, server) {
    this.bus = bus;
    this.server = server;
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
            this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', msg.sender, this.getBingo()));
            break;

        default:
            console.warn('BSServer.onAction(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};
BSServer.prototype.onEvent = function(msg) {
    //this.bus.emit('messageSend', new BSMessage('event', msg.name, msg.sender, null, msg.data));

    switch(msg.name) {
        case 'newGame':
            this.createGame(msg.sender, msg.data);
            break;

        case 'joinGame':
            this.joinGame(msg.sender, msg.data.game_id);
            break;

        case 'leaveGame':
            this.leaveGame(msg.sender);
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

            this.updateGame(msg.data.game_id);
            break;

        case 'buzzWord':
            // set word active
            var words = this.games[msg.data.game_id].boards[msg.sender];

            for(var i = 0; i < words.length; i++) {
                if(words[i].word === msg.data.word) {
                    this.games[msg.data.game_id].boards[msg.sender][i].active = true;
                }
            }

            this.updateGame(msg.data.game_id);
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

            this.updateGame(msg.data.game_id);
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

BSServer.prototype.getBingo = function() {
    var games = [];
    for (var key in this.games) {
        if( this.games.hasOwnProperty(key) ) {
            var game = this.games[key];
            games.push({
                id: game.id,
                name: game.name,
                width: game.width,
                height: game.height,
                players: game.players.length,
                stage: game.stage,
                words: game.words.length,
                user: this.players[game.user].name
            });
        }
    }

    return {
        games: games,
        players: this.players,
        last_words: this.last_words
    };
};

BSServer.prototype.createGame = function(user_id, game) {
    var id = Utils.generateUUID();
    this.games[id] = {
        id: id,
        name: game.name,
        width: game.width,
        height: game.height,
        stage: 'words',
        words: [],
        boards: {},
        players: [user_id],
        user: user_id
    };

    this.updateGame(id);
    this.bus.emit('messageSend', new BSMessage('event', 'createGame', 'server', null, {user: user_id, game: id}));
    this.log(this.players[user_id].name + ' created game "' + this.games[id].name + '"');
};
BSServer.prototype.joinGame = function(user_id, game_id) {
    var players = this.games[game_id].players;
    var found = false;
    for(var i = 0; i < players.length; i++) {
        if(players[i] === user_id) {
            found = true;
            break;
        }
    }
    if(!found) {
        this.games[game_id].players.push(user_id);
        this.log(this.players[user_id].name + ' joined game "' + this.games[game_id].name + '"');
    }
    this.updateGame(game_id);

    this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', null, this.getBingo()));
};
BSServer.prototype.leaveGame = function(user_id) {
    for (var game_id in this.games) {
        if( this.games.hasOwnProperty(game_id) ) {
            var changed = false;
            var players = this.games[game_id].players;
            var players_new = [];

            for(var i = 0; i < players.length; i++) {
                if(players[i] !== user_id) {
                    players_new.push(players[i]);
                } else {
                    changed = true;
                }
            }

            if(changed) {
                this.games[game_id].players = players_new;
                this.updateGame(game_id);

                this.log(this.players[user_id].name + ' left game "' + this.games[game_id].name + '"');
            }
        }
    }

    this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', null, this.getBingo()));
};
BSServer.prototype.updateGame = function(game_id) {
    var game = this.games[game_id];
    var words = [];

    if(game.stage === 'bingo') {
        for(var i = 0; i < game.words.length; i++) {
            words.push({
                word: game.words[i].word,
                active: false
            });
        }
    }

    for(var i = 0; i < game.players.length; i++) {
        var player_id = game.players[i];

        if(game.stage === 'bingo') {
            if(game.boards[player_id] === undefined || game.boards[player_id] === null) {
                var board = Utils.shuffle(JSON.parse(JSON.stringify(words)));

                this.games[game_id].boards[player_id] = board;
            }
        }

        this.bus.emit('messageSend', new BSMessage('data', 'game', 'server', player_id, this.games[game_id]));
    }
};

BSServer.prototype.chat = function(user_id, message) {
    this.bus.emit('messageSend', new BSMessage('event', 'chat', 'server', null, {user: user_id, message: message}));
};
BSServer.prototype.log = function(message) {
    this.bus.emit('messageSend', new BSMessage('event', 'log', 'server', null, {message: message}));
};

BSServer.prototype.addPlayer = function(user) {
    this.players[user.id] = user;
};

module.exports = BSServer;