var BSMessage = require('./BSMessage');
var Utils = require('./Utils.js');

function BSServer(bus) {
    this.bus = bus;
    this.games = {};
    this.players = {};
    this.last_words = [];
}

BSServer.prototype.onMessage = function (msg) {
    switch (msg.type) {
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
            break;
    }
};
BSServer.prototype.onAction = function (msg) {
    switch (msg.name) {
        case 'getData':
            this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', msg.sender, this.getBingo()));
            break;

        default:
            console.warn('BSServer.onAction(msg): unknown name: ' + msg.name);
            break;
    }
};
BSServer.prototype.onEvent = function (msg) {
    switch (msg.name) {
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
            this.addWord(msg.sender, msg.data.game_id, msg.data.word);
            break;

        case 'buzzWord':
            this.buzzWord(msg.sender, msg.data.game_id, msg.data.word);
            break;

        case 'removeWord':
            this.removeWord(msg.sender, msg.data.game_id, msg.data.word);
            break;

        case 'chat':
            this.chat(msg.sender, msg.data);
            break;

        default:
            console.warn('BSServer.onEvent(msg): unknown name: ' + msg.name);
            break;
    }
};
BSServer.prototype.onData = function (msg) {
    return false;
};

BSServer.prototype.cleanup = function () {
    var changed = false;
    var games_new = {};

    for (var key in this.games) {
        if (this.games.hasOwnProperty(key)) {
            var game = this.games[key];

            // at least 2 players and not older than 1 day
            if(game.players.length > 2 || game.start + 86400000 > Date.now()) {
                games_new[key] = game;
            } else {
                changed = true;
                this.log('server', 'server removed game "' + game.name + '"');

                // close player games
                for (var i = 0; i < game.players.length; i++) {
                    this.bus.emit('messageSend', new BSMessage('data', 'game', 'server', game.players[i], null));
                }
            }
        }
    }

    if(changed) {
        this.games = games_new;
        this.updateBingo();
    }
};

BSServer.prototype.getBingo = function () {
    var games = [];
    for (var key in this.games) {
        if (this.games.hasOwnProperty(key)) {
            var game = this.games[key];
            games.push({
                id: game.id,
                start: game.start,
                name: game.name,
                size: game.size,
                players: game.players.length,
                stage: game.stage,
                words: game.words.length,
                winner: game.winner,
                user: this.players[game.user].name
            });
        }
    }

    // sort by start date
    function compare_start(a, b) {
        return a.start - b.start;
    }
    games.sort(compare_start);

    return {
        games: games,
        players: this.players,
        last_words: this.last_words
    };
};

BSServer.prototype.createGame = function (user_id, game) {
    var id = Utils.generateUUID();
    this.games[id] = {
        id: id,
        start: Date.now(),
        name: game.name,
        size: game.size,
        stage: 'words',
        words: [],
        boards: {},
        players: [user_id],
        winner: null,
        user: user_id
    };

    this.updateGame(id);
    this.bus.emit('messageSend', new BSMessage('event', 'createGame', 'server', null, {user: user_id, game: id}));
    this.log(user_id, this.players[user_id].name + ' created game "' + this.games[id].name + '"');
};
BSServer.prototype.joinGame = function (user_id, game_id) {
    var players = this.games[game_id].players;
    var found = false;
    for (var i = 0; i < players.length; i++) {
        if (players[i] === user_id) {
            found = true;
            break;
        }
    }
    if (!found) {
        this.games[game_id].players.push(user_id);
        this.log(user_id, this.players[user_id].name + ' joined game "' + this.games[game_id].name + '"');
    }
    this.updateGame(game_id);

    this.updateBingo();
};
BSServer.prototype.leaveGame = function (user_id) {
    for (var game_id in this.games) {
        if (this.games.hasOwnProperty(game_id)) {
            var changed = false;
            var players = this.games[game_id].players;
            var players_new = [];

            for (var i = 0; i < players.length; i++) {
                if (players[i] !== user_id) {
                    players_new.push(players[i]);
                } else {
                    changed = true;
                }
            }

            if (changed) {
                this.games[game_id].players = players_new;
                this.updateGame(game_id);

                this.log(user_id, this.players[user_id].name + ' left game "' + this.games[game_id].name + '"');
            }
        }
    }

    this.updateBingo();
};

BSServer.prototype.addWord = function (user_id, game_id, word) {
    // only in words stage
    if(this.games[game_id].stage !== 'words') {
        return;
    }

    // add word to game if new
    var words = this.games[game_id].words;
    var found = false;
    for (var i = 0; i < words.length; i++) {
        if (words[i].word === word) {
            found = true;
            break;
        }
    }
    if (!found) {
        this.games[game_id].words.push({word: word, user: this.players[user_id]});
    }

    // switch stage if word limit reached
    var game = this.games[game_id];
    if (game.words.length === game.size * game.size) {
        this.games[game_id].stage = 'bingo';
        this.updateGame(game_id);
    }

    // add to last_words if new, cut at 50 words
    found = false;
    for (var i = 0; i < this.last_words.length; i++) {
        if (this.last_words[i].word === word) {
            found = true;
            break;
        }
    }
    if (!found) {
        this.last_words.push({word: word, user: this.players[user_id]});
    }
    this.last_words = this.last_words.slice(0, 50);

    this.updateGame(game_id);
};
BSServer.prototype.removeWord = function (user_id, game_id, word) {
    // only in words stage
    if(this.games[game_id].stage !== 'words') {
        return;
    }

    var changed = false;
    var words = this.games[game_id].words;
    var words_new = [];
    for (var i = 0; i < words.length; i++) {
        if (words[i].word !== word) {
            words_new.push(words[i]);
        } else {
            changed = true;
        }
    }

    if (changed) {
        this.games[game_id].words = words_new;
        this.updateGame(game_id);

        this.log(user_id, this.players[user_id].name + ' removed word "' + word + '" in game "' + this.games[game_id].name + '"');
    }
};
BSServer.prototype.buzzWord = function (user_id, game_id, word) {
    // only in bingo stage
    if(this.games[game_id].stage !== 'bingo') {
        return;
    }

    // swap word active
    var words = this.games[game_id].boards[user_id];

    for (var i = 0; i < words.length; i++) {
        if (words[i].word === word) {
            this.games[game_id].boards[user_id][i].active = !words[i].active;
        }
    }

    this.updateGame(game_id);
};

BSServer.prototype.updateBingo = function () {
    this.bus.emit('messageSend', new BSMessage('data', 'bingo', 'server', null, this.getBingo()));
};
BSServer.prototype.updateGame = function (game_id) {
    var game = this.games[game_id];
    var words = [];

    if (game.stage === 'bingo') {
        for (var i = 0; i < game.words.length; i++) {
            words.push({
                word: game.words[i].word,
                active: false
            });
        }
    }

    for (var i = 0; i < game.players.length; i++) {
        var player_id = game.players[i];

        if (game.stage === 'bingo') {
            if (game.boards[player_id] === undefined || game.boards[player_id] === null) {
                var board = Utils.shuffle(JSON.parse(JSON.stringify(words)));

                this.games[game_id].boards[player_id] = board;
            } else {
                var win = false, win_tmp;
                var board = game.boards[player_id];
                var line, row;

                // check for win - horizontal
                for(line = 0; line < game.size && !win; line++) {
                    win_tmp = true;

                    for(row = 0; row < game.size && !win; row++) {
                        if(board[line * game.size + row].active === false) {
                            win_tmp = false;
                            break;
                        }
                    }

                    win = win_tmp;
                }

                // check for win - vertical
                for(row = 0; row < game.size && !win; row++) {
                    win_tmp = true;

                    for(line = 0; line < game.size && !win; line++) {
                        if(board[line * game.size + row].active === false) {
                            win_tmp = false;
                            break;
                        }
                    }

                    win = win_tmp;
                }

                // check for win - diagonal
                var win_tmp_left = true;
                var win_tmp_right = true;
                for(var i = 0; i < game.size && !win && (win_tmp_left || win_tmp_right); i++) {
                    // left up to right down
                    if(board[i * game.size + i].active === false) {
                        win_tmp_left = false;
                    }
                    // right up to left down
                    if(board[(i+1) * game.size - 1 - i].active === false) {
                        win_tmp_right = false;
                    }
                }
                if(win_tmp_left || win_tmp_right) {
                    win = true;
                }

                if(win) {
                    this.games[game_id].stage = 'won';
                    this.games[game_id].winner = player_id;
                    this.log(player_id, this.players[player_id].name + ' has won game "' + game.name + '"');
                }
            }
        }

        this.bus.emit('messageSend', new BSMessage('data', 'game', 'server', player_id, this.games[game_id]));
    }
};

BSServer.prototype.chat = function (user_id, message) {
    this.bus.emit('messageSend', new BSMessage('event', 'chat', user_id, null, message));
};
BSServer.prototype.log = function (user_id, message) {
    this.bus.emit('messageSend', new BSMessage('event', 'log', user_id, null, message));
};

BSServer.prototype.addPlayer = function (user) {
    this.players[user.id] = user;
    this.updateBingo();
};

module.exports = BSServer;