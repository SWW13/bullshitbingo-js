(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BSMessage = require('./BSMessage');
var BSUser = require('./BSUser');
var Utils = require('./Utils.js');

function BSClient(ws) {
    this.ws = ws;
    this.games = [];
    this.players = {};
    this.last_words = [];
    this.user = new BSUser();
    this.game = null;

    this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());
    this.ws.send(new BSMessage('action', 'getData', this.user.id, 'server', null).toString());

    var that = this;
    document.getElementById('menu-logo').addEventListener('click', function (event) {
        that.leaveGame(event);
    });
    document.getElementById('chat-form').addEventListener('submit', function (event) {
        event.preventDefault();
        that.sendMessage(event);
    });
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
            return false;
            break;
    }
};
BSClient.prototype.onAction = function (msg) {
    return false;
};
BSClient.prototype.onEvent = function (msg) {
    switch (msg.name) {
        case 'chat':
        case 'log':
            this.onChatMessage(msg);
            break;

        default:
            console.warn('BSServer.onEvent(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};
BSClient.prototype.onData = function (msg) {
    switch (msg.name) {
        case 'bingo':
            this.fromString(msg.data);
            this.render();
            console.log(this);
            break;

        case 'game':
            this.game = msg.data;
            this.render();
            console.log(this);
            break;

        default:
            console.warn('BSClient.onData(msg): unknown name: ' + msg.name);
            return false;
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

    navbar.innerHTML = templates['navbar'].render({game: this.game});

    if (this.game === null) {
        content.innerHTML = templates['create-game'].render({username: this.user.name});
        content.innerHTML += templates['game-list'].render({games: this.games});

        var create_game = document.getElementById('create-game');
        create_game.addEventListener('submit', function (event) {
            that.createGame(event);
        });
        var button_join = document.getElementsByClassName('button-join');
        for (var i = 0; i < button_join.length; i++) {
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
                    for (var i = 0; i < button_addLastWord.length; i++) {
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
                for (var i = 0; i < button_removeWord.length; i++) {
                    button_removeWord[i].addEventListener('click', function (event) {
                        that.removeWord(this.dataset.word);
                        console.log(event);
                    });
                }
                break;

            case 'bingo':
                content.innerHTML = templates['bingo-board'].render({lines: this.getBoard()});
                content.innerHTML += templates['bingo-board-overview'].render({players: this.getBoardOverview()});

                var button_buzzWord = document.getElementsByClassName('button-buzzWord');
                for (var i = 0; i < button_buzzWord.length; i++) {
                    button_buzzWord[i].addEventListener('click', function (event) {
                        event.preventDefault();
                        that.buzzWord(this.dataset.word);
                    });
                }
                break;

            case 'won':
                content.innerHTML = templates['won'].render({name: this.players[this.game.winner].name, lines: this.getBoard(this.game.winner)});

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

BSClient.prototype.sendMessage = function (event) {
    this.setUsername();
    var message = document.getElementById('chat-message');
    this.ws.send(new BSMessage('event', 'chat', this.user.id, 'server', message.value).toString());
    message.value = '';
};
BSClient.prototype.onChatMessage = function (msg) {
    var chat_table = document.getElementById('chat-table');
    var row = chat_table.insertRow(-1);
    var cell_time = row.insertCell(0);
    var cell_user = row.insertCell(1);
    var cell_message = row.insertCell(2);
    var d = new Date();

    cell_time.innerHTML = '<i>' + ('00' + d.getHours()).slice(-2) + ':' + ('00' + d.getMinutes()).slice(-2) + ':' + ('00' + d.getSeconds()).slice(-2) + '</i>';

    if (msg.name === 'chat') {
        cell_user.innerHTML = '<b>&lt;' + this.getUsername(msg.sender) + '&gt;</b>';
        cell_message.innerHTML = msg.data;
    } else {
        cell_message.innerHTML = '<i>' + msg.data + '</i>';
    }

    var chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;
};

BSClient.prototype.setUsername = function (username) {
    if (this.user.hasName() && typeof(username) !== "string") {
        return;
    } else if (typeof(username) !== "string") {
        username = prompt('Please enter your username:');
    }

    if (typeof(username) === "string") {
        this.user.setName(username);
        this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());
    } else {
        this.setUsername();
    }
};
BSClient.prototype.getUsername = function (user_id) {
    if(this.players.hasOwnProperty(user_id) && this.players[user_id].name !== null) {
        return this.players[user_id].name;
    } else {
        return 'unknown player (' + user_id + ')';
    }
};

BSClient.prototype.createGame = function () {
    var username = document.getElementById('game-username').value;
    var game_name = document.getElementById('game-name').value;
    var e_size = document.getElementById('game-size');
    var game_size = e_size.options[e_size.selectedIndex].value;

    this.setUsername(username);
    var game = {
        name: game_name,
        size: game_size
    };

    this.ws.send(new BSMessage('event', 'newGame', this.user.id, 'server', game).toString());
    this.render();
};
BSClient.prototype.joinGame = function (event) {
    this.setUsername();
    var game_id = event.target.dataset.id;
    this.ws.send(new BSMessage('event', 'joinGame', this.user.id, 'server', {game_id: game_id}).toString());
};
BSClient.prototype.leaveGame = function (event) {
    this.game = null;
    this.ws.send(new BSMessage('event', 'leaveGame', this.user.id, 'server'));
    this.render();
};
BSClient.prototype.addWord = function (word) {
    if (word !== '') {
        this.ws.send(new BSMessage('event', 'addWord', this.user.id, 'server', {game_id: this.game.id, word: word}).toString());
        this.render();
    }
};
BSClient.prototype.removeWord = function (word) {
    this.ws.send(new BSMessage('event', 'removeWord', this.user.id, 'server', {game_id: this.game.id, word: word}).toString());
    this.render();
};
BSClient.prototype.buzzWord = function (word) {
    if (word !== '') {
        this.ws.send(new BSMessage('event', 'buzzWord', this.user.id, 'server', {game_id: this.game.id, word: word}).toString());
        this.render();
    }
};
BSClient.prototype.getBoard = function (user_id) {
    if(user_id === undefined) {
        user_id = this.user.id;
    }

    return this.getLines(this.game.boards[user_id]);
};
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

    if (board !== undefined) {
        for (var i = 0; i < board.length; i++) {
            if (i % this.game.size === 0 && i > 0) {
                lines.push(line);
                line = [];
            }

            line.push({
                word: board[i].word,
                css_class: (board[i].active ? 'primary' : 'default')
            });
        }
        lines.push(line);
    }

    return lines;
};

module.exports = BSClient;
},{"./BSMessage":2,"./BSUser":3,"./Utils.js":4}],2:[function(require,module,exports){
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
/*
 BSUser.fromString = function(user) {
 if(user !== undefined && user !== null) {
 if(typeof(user) === "string") {
 user = JSON.parse(user);
 }
 var bs_user = new BSUser(false, true);
 bs_user.id = user.id;
 bs_user.name = user.name;

 return bs_user;
 }
 return null;
 }
 */

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
    removeHTML: function(string){
        return string.replace(/<[^>]+>/ig, '');
    }
};
},{}],5:[function(require,module,exports){
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
},{"./modules/BSClient.js":1,"./modules/BSMessage.js":2,"./modules/BSUser.js":3}]},{},[5]);
