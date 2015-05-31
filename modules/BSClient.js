var BSMessage = require('./BSMessage');
var BSUser = require('./BSUser');
var Utils = require('./Utils');
var escape = require('escape-html');

function BSClient(ws) {
    this.ws = ws;
    this.games = [];
    this.players = {};
    this.last_words = [];
    this.user = new BSUser();
    this.game = null;
    this.unread = 0;

    this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());
    this.ws.send(new BSMessage('action', 'getData', this.user.id, 'server', null).toString());
}

BSClient.prototype.onMessage = function (msg_data) {
    var msg = BSMessage.fromString(msg_data);

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
            console.warn('BSClient.onMessage(msg): unknown type: ' + msg.type);
            break;
    }
};
BSClient.prototype.onAction = function (msg) {
    console.warn('BSClient.onAction(msg): unknown name: ' + msg.name);
};
BSClient.prototype.onEvent = function (msg) {
    switch (msg.name) {
        case 'chat':
        case 'log':
            this.onChatMessage((msg.name === 'chat' ? msg.sender : null), msg.data);
            break;

        default:
            console.warn('BSClient.onEvent(msg): unknown name: ' + msg.name);
            break;
    }
};
BSClient.prototype.onData = function (msg) {
    switch (msg.name) {
        case 'bingo':
            this.fromString(msg.data);
            this.render();
            break;

        case 'game':
            this.game = msg.data;
            this.render();
            break;

        default:
            console.warn('BSClient.onData(msg): unknown name: ' + msg.name);
            break;
    }
};

BSClient.prototype.fromString = function (data) {
    this.games = [];

    if (data !== undefined) {
        this.games = data.games;
        this.players = data.players;
        this.last_words = data.last_words;
    }
};
BSClient.prototype.toString = function () {
    var games = [];
    for (var key in this.games) {
        if (this.games.hasOwnProperty(key)) {
            games.push(this.games[key]);
        }
    }

    return {
        games: games,
        last_words: this.last_words
    };
};

BSClient.prototype.render = function () {
    var that = this;
    var content = document.getElementById('content');
    var navbar = document.getElementById('navbar');
    var i;

    navbar.innerHTML = templates['navbar'].render({game: this.game});

    if (this.game === null) {
        var game_list = document.getElementById('game-list');

        if(!game_list) {
            content.innerHTML = templates['game-list'].render({games: this.games});
            content.innerHTML += templates['create-game'].render({username: this.user.name});

            var create_game = document.getElementById('create-game');
            create_game.addEventListener('submit', function (event) {
                event.preventDefault();
                that.createGame(event);
            });
        } else {
            game_list.outerHTML = templates['game-list'].render({games: this.games});
        }

        var button_join = document.getElementsByClassName('button-join');
        for (i = 0; i < button_join.length; i++) {
            button_join[i].addEventListener('click', function (event) {
                that.joinGame(event);
            });
        }
    }
    else {
        switch (this.game.stage) {
            case 'words':
                var wordlist = document.getElementById('wordlist-table');
                if (wordlist === null) {
                    content.innerHTML = templates['words'].render({last_words: this.last_words});
                    wordlist = document.getElementById('wordlist-table');

                    var button_addLastWord = document.getElementsByClassName('button-addLastWord');
                    for (i = 0; i < button_addLastWord.length; i++) {
                        button_addLastWord[i].addEventListener('click', function (event) {
                            that.addWord(this.dataset.word);
                        });
                    }
                }
                wordlist.innerHTML = templates['wordlist'].render({words: this.game.words});

                var count = document.getElementById('wordlist-count');
                count.innerHTML = '(' + this.game.words.length + '/' + this.game.size * this.game.size + ')';

                var word = document.getElementById('word');
                word.focus();

                var word_add = document.getElementById('wordlist-form');
                word_add.addEventListener('submit', function (event) {
                    event.preventDefault();
                    that.addWord(word.value);
                    word.value = '';
                });
                var button_removeWord = document.getElementsByClassName('button-removeWord');
                for (i = 0; i < button_removeWord.length; i++) {
                    button_removeWord[i].addEventListener('click', function (event) {
                        that.removeWord(this.dataset.id);
                    });
                }
                break;

            case 'bingo':
                var boardEl = document.getElementById('board');
                if (!boardEl) {
                    content.innerHTML = templates['bingo-board'].render({lines: this.getBoardLines()});

                    var button_buzzWord = document.getElementsByClassName('button-buzzWord');
                    for (i = 0; i < button_buzzWord.length; i++) {
                        button_buzzWord[i].addEventListener('click', function (event) {
                            event.preventDefault();
                            that.buzzWord(this.dataset.id);
                        });
                    }
                } else {
                    var board = this.getBoard();

                    if (board !== null) {
                        for (i = 0; i < board.length; i++) {
                            var button = boardEl.querySelector('button.button-buzzWord[data-id="' + board[i].id + '"]');
                            button.className = button.className.replace(/btn-[a-z]+/, 'btn-' + (board[i].active ? 'primary' : 'default'));
                        }
                    }
                }

                var board_other = document.getElementById('board-other');
                board_other.innerHTML = templates['bingo-board-overview'].render({players: this.getBoardOverview()});
                break;

            case 'won':
                content.innerHTML = templates['won'].render({name: this.players[this.game.winner].name, lines: this.getBoardLines(this.game.winner)});

                var go_back = document.getElementById('go-back');
                go_back.addEventListener('click', function (event) {
                    event.preventDefault();
                    that.leaveGame(event);
                });
                break;

            default:
                console.warn('Uknown stage: ' + this.game.stage);
                break;
        }
    }
};
BSClient.prototype.renderNavbar = function () {
    if (Utils.isVisible(document.getElementById('chat-form'))) {
        this.unread = 0;
    }

    var navbar_right = document.getElementById('navbar-right');
    navbar_right.innerHTML = templates['navbar-right'].render({unread: this.unread, username: this.user.name});

    var that = this;
    document.getElementById('edit-username').addEventListener('click', function (event) {
        event.preventDefault();
        that.askUsername(true);
    });
};

BSClient.prototype.sendMessage = function (event) {
    if (!this.askUsername()) {
        this.onChatMessage(null, '<b>Error:</b> Please enter a username.');
        return;
    }

    var message = document.getElementById('chat-message');
    if (message.length < 1 || message.length > 1024) {
        this.onChatMessage(null, '<b>Error:</b> messages must be 1 to 1024 characters long.');
    } else {
        this.ws.send(new BSMessage('event', 'chat', this.user.id, 'server', message.value).toString());
        message.value = '';
    }
};
BSClient.prototype.onChatMessage = function (user_id, message) {
    var chat_table = document.getElementById('chat-table');
    var row = chat_table.insertRow(-1);
    var cell_time = row.insertCell(0);
    var cell_user = row.insertCell(1);
    var cell_message = row.insertCell(2);
    var d = new Date();

    cell_time.innerHTML = '<i>' + ('00' + d.getHours()).slice(-2) + ':' + ('00' + d.getMinutes()).slice(-2) + ':' + ('00' + d.getSeconds()).slice(-2) + '</i>';

    if (user_id !== null) {
        cell_user.innerHTML = '<b>&lt;' + this.getUsername(user_id) + '&gt;</b>';
        cell_message.innerHTML = message;
    } else {
        cell_message.innerHTML = '<i>' + message + '</i>';
    }

    // scroll chat down
    var chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;

    this.unread++;
    this.renderNavbar();
};

BSClient.prototype.askUsername = function (change) {
    if (!change && this.user.hasName()) {
        return true;
    }

    return this.setUsername(prompt('Please enter your username:'));
};
BSClient.prototype.setUsername = function (username) {
    if (typeof(username) === "string" && username.length > 0) {
        this.user.setName(username);
        this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());
        return true;
    }

    return false;
};
BSClient.prototype.getUsername = function (user_id) {
    if (this.players.hasOwnProperty(user_id) && this.players[user_id].name !== null) {
        return escape(this.players[user_id].name);
    } else {
        return 'unknown player (' + user_id + ')';
    }
};

BSClient.prototype.createGame = function () {
    var username = document.getElementById('game-username').value;
    var game_name = document.getElementById('game-name').value;
    var e_size = document.getElementById('game-size');
    var game_size = e_size.options[e_size.selectedIndex].value;

    if (!this.setUsername(username)) {
        this.onChatMessage(null, '<b>Error:</b> Please enter a username.');
        return;
    }

    var game = {
        name: game_name,
        size: game_size
    };

    this.ws.send(new BSMessage('event', 'newGame', this.user.id, 'server', game).toString());
    this.render();
};
BSClient.prototype.joinGame = function (event) {
    if (!this.askUsername()) {
        this.onChatMessage(null, '<b>Error:</b> Please enter a username.');
        return;
    }

    var game_id = event.target.dataset.id;
    this.ws.send(new BSMessage('event', 'joinGame', this.user.id, 'server', {game_id: game_id}).toString());
};
BSClient.prototype.leaveGame = function (event) {
    this.game = null;
    this.ws.send(new BSMessage('event', 'leaveGame', this.user.id, 'server').toString());
    this.render();
};
BSClient.prototype.addWord = function (word) {
    if (word !== '') {
        this.ws.send(new BSMessage('event', 'addWord', this.user.id, 'server', {game_id: this.game.id, word: word}).toString());
    }
};
BSClient.prototype.removeWord = function (word_id) {
    this.ws.send(new BSMessage('event', 'removeWord', this.user.id, 'server', {game_id: this.game.id, word_id: word_id}).toString());
};
BSClient.prototype.buzzWord = function (word_id) {
    this.ws.send(new BSMessage('event', 'buzzWord', this.user.id, 'server', {game_id: this.game.id, word_id: word_id}).toString());
};
BSClient.prototype.getBoard = function (user_id) {
    if (user_id === undefined) {
        user_id = this.user.id;
    }

    if (this.game.boards.hasOwnProperty(user_id)) {
        return this.game.boards[user_id];
    } else {
        return null;
    }
};
BSClient.prototype.getBoardLines = function (user_id) {
    return this.getLines(this.getBoard(user_id));
}
BSClient.prototype.getBoardOverview = function () {
    var players = this.game.players;
    var boards = [];

    for (var i = 0; i < players.length; i++) {
        boards.push({
            id: players[i],
            name: this.players[players[i]].name,
            lines: this.getLines(this.game.boards[players[i]])
        });
    }

    return boards;
};
BSClient.prototype.getLines = function (board) {
    var lines = [];
    var line = [];

    if (board !== undefined && board !== null) {
        for (var i = 0; i < board.length; i++) {
            if (i % this.game.size === 0 && i > 0) {
                lines.push(line);
                line = [];
            }

            line.push({
                id: board[i].id,
                word: board[i].word,
                css_class: (board[i].active ? 'primary' : 'default')
            });
        }
        lines.push(line);
    }

    return lines;
};

module.exports = BSClient;