(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
            content.innerHTML += templates['create-game'].render({});

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
                            button.className = button.className.replace(/btn-[a-z]+/, 'btn-' + (board[i].active ? 'primary' :
                                (this.game.words[board[i].id].active ? 'info' : 'default')));
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
    var chat = document.getElementById('chat');
    var d = new Date();

    var time = ('00' + d.getHours()).slice(-2) + ':' + ('00' + d.getMinutes()).slice(-2) + ':' + ('00' + d.getSeconds()).slice(-2);

    if (user_id !== null) {
        chat.innerHTML += templates['chat-row'].render({time: time, username: this.getUsername(user_id), message: message});
    } else {
        chat.innerHTML += templates['chat-row-log'].render({time: time, message: message});
    }

    // scroll down
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
    if (!this.askUsername()) {
        this.onChatMessage(null, '<b>Error:</b> Please enter a username.');
        return;
    }

    var game_name = document.getElementById('game-name').value;
    var e_size = document.getElementById('game-size');
    var game_size = e_size.options[e_size.selectedIndex].value;

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
                css_class: (board[i].active ? 'primary' :
                    (this.game.words[board[i].id].active ? 'info' : 'default'))
            });
        }
        lines.push(line);
    }

    return lines;
};

module.exports = BSClient;
},{"./BSMessage":2,"./BSUser":3,"./Utils":4,"escape-html":5}],2:[function(require,module,exports){
function BSMessage(type, name, sender, receiver, data) {
    this.type = 'unknown';
    this.name = 'unknown';
    this.sender = 'unknown';
    this.receiver = null;
    this.data = null;

    if (type !== undefined) {
        this.type = type;
    }
    if (name !== undefined) {
        this.name = name;
    }
    if (sender !== undefined) {
        this.sender = sender;
    }
    if (receiver !== undefined) {
        this.receiver = receiver;
    }
    if (data !== undefined) {
        this.data = data;
    }
}

BSMessage.prototype.isEmpty = function () {
    return (this.data !== null && this.data !== undefined);
};

BSMessage.prototype.is = function (type, name) {
    return this.action === type &&
        ((name !== undefined) ? this.name === name : true);
};

BSMessage.prototype.toString = function () {
    return JSON.stringify({
        type: this.type,
        name: this.name,
        sender: this.sender,
        receiver: this.receiver,
        data: this.data
    });
};
BSMessage.fromString = function (msg) {
    if (msg !== undefined && msg !== null) {
        if (typeof(msg) === "string") {
            msg = JSON.parse(msg);
        }
        return new BSMessage(msg.type, msg.name, msg.sender, msg.receiver, msg.data);
    } else {
        console.warn('BSMessage: empty message');
        console.log(msg);
        return null;
    }
}

module.exports = BSMessage;
},{}],3:[function(require,module,exports){
var Utils = require('./Utils.js');

function BSUser() {
    this.id = Utils.generateUUID();
    this.name = null;

    this.load();
}

BSUser.prototype.setName = function (name) {
    if (name !== undefined) {
        this.name = name;
        this.save();
    }
};
BSUser.prototype.hasName = function () {
    return (typeof(this.name) === "string" && this.name.length >= 1);
};

BSUser.prototype.load = function () {
    if (typeof(Storage) !== "undefined") {
        var user = localStorage.user;
        this.id = null;
        this.name = null;

        if (user !== undefined) {
            user = JSON.parse(localStorage.user);
        }

        if (user !== undefined && user !== null) {
            if (user.id !== undefined && user.id !== null) {
                this.id = user.id;
            }

            if (user.name !== undefined) {
                this.name = user.name;
            }
        } else {
            this.id = Utils.generateUUID();
            console.log('BSUser: created new user uuid: ' + this.id);
        }
    } else {
        console.warn('BSUser.load: LocalStorage not available.');
    }
};
BSUser.prototype.save = function () {
    if (typeof(Storage) !== "undefined") {
        localStorage.user = this.toString();
    } else {
        console.warn('BSUser.save: LocalStorage not available.');
    }
};

BSUser.prototype.toObject = function () {
    return {
        id: this.id,
        name: this.name
    };
};
BSUser.prototype.toString = function () {
    return JSON.stringify(this.toObject());
};

module.exports = BSUser;
},{"./Utils.js":4}],4:[function(require,module,exports){
module.exports = {
    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return uuid;
    },
    shuffle: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    removeHTML: function (string) {
        return string.replace(/<[^>]+>/ig, '');
    },
    isVisible: function (element) {
        /* Get the TOP position of a given element. */
        function getPositionTop(element) {
            var offset = 0;
            while (element) {
                offset += element.offsetTop;
                element = element.offsetParent;
            }
            return offset;
        }

        if (!element) {
            return false;
        }

        // Get the top and bottom position of the given element.
        var posTop = getPositionTop(element);
        var posBottom = posTop + element.offsetHeight;

        // Get the top and bottom position of the *visible* part of the window.
        var visibleTop = visibleTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        var visibleBottom = visibleTop + window.innerHeight;

        return ((posBottom >= visibleTop) && (posTop <= visibleBottom));
    }
};
},{}],5:[function(require,module,exports){
/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

module.exports = function(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

},{}],6:[function(require,module,exports){
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
},{"./modules/BSClient.js":1,"./modules/BSMessage.js":2,"./modules/BSUser.js":3}]},{},[6]);
