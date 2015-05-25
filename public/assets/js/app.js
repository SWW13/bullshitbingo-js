(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BSMessage = require('./BSMessage');
var BSUser = require('./BSUser');
var Utils = require('./Utils.js');

function BSClient(ws) {
    this.ws = ws;
    this.games = [];
    this.last_words = [];
    this.user = new BSUser();
    this.game = null;

    this.ws.send(new BSMessage('action', 'user', this.user.id, 'server', this.user.toString()).toString());
    this.ws.send(new BSMessage('action', 'getData', this.user.id, 'server', null).toString());
}

BSClient.prototype.onMessage = function(msg_data) {
    var msg = BSMessage.fromString(msg_data);

    if(msg.sender === this.user.id) {
        return true;
    }

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
            console.warn('BSClient.onMessage(msg): unknown type: ' + msg.type);
            return false;
            break;
    }
};
BSClient.prototype.onAction = function(msg) {
    return false;
};
BSClient.prototype.onEvent = function(msg) {
    switch(msg.name) {
        case 'newGame':
            this.games[msg.data.id] = msg.data;
            break;

        default:
            console.warn('BSClient.onEvent(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};
BSClient.prototype.onData = function(msg) {
    switch(msg.name) {
        case 'BSServer':
            this.fromString(msg.data);
            this.render();
            break;

        default:
            console.warn('BSClient.onData(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};

BSClient.prototype.fromString = function(data) {
    if(data !== undefined) {
        this.games = [];
        for(var i = 0; i < data.games.length; i++){
            this.games.push(BSGame.fromString(data.games[i]));
        }

        this.last_words = [];
        for(var i = 0; i < data.last_words.length; i++){
            this.last_words.push(BSGame.fromString(data.last_words[i]));
        }
    }
};

BSClient.prototype.render = function() {
    var content = document.getElementById('content');
    var navbar = document.getElementById('navbar');

    navbar.innerHTML = templates['navbar'].render({game: this.game});

    if(this.game === null) {
        content.innerHTML = templates['create-game'].render({username: this.user.name});
        content.innerHTML += templates['game-list'].render({games: this.toString().games});

        var that = this;
        var create_game = document.getElementById('create-game');
        create_game.addEventListener('click', function(){
            that.createGame();
        });
    }
    else {
        switch(this.game.state) {
            case 'words':
                content.innerHTML = templates['word-list'].render({words: this.game.words, last_words: this.last_words});
                break;

            default:
                console.warn('Uknown state: ' + this.game.state);
                break;
        }
    }
};

BSClient.prototype.createGame = function() {
    var username = document.getElementById('username').value;
    var game = document.getElementById('game').value;
    var width = document.getElementById('width').value;
    var height = document.getElementById('height').value;

    this.user.setName(username);
    this.game = {
        id: Utils.generateUUID(),
        name: game,
        width: width,
        height: height,
        state: 'words',
        user: this.user.toString()
    };

    this.ws.send(new BSMessage('event', 'newGame', this.user.id, 'server', this.game));
    this.render();
};

module.exports = BSClient;
},{"./BSMessage":2,"./BSUser":3,"./Utils.js":4}],2:[function(require,module,exports){
function BSMessage(type, name, sender, receiver, data) {
    this.type = 'unknown';
    this.name = 'unknown';
    this.sender = 'unknown';
    this.receiver = null;
    this.data = null;

    if(type !== undefined) {
        this.type = type;
    }
    if(name !== undefined) {
        this.name = name;
    }
    if(sender !== undefined) {
        this.sender = sender;
    }
    if(receiver !== undefined) {
        this.receiver = receiver;
    }
    if(data !== undefined) {
        this.data = data;
    }
}

BSMessage.prototype.isEmpty = function() {
    return (this.data !== null && this.data !== undefined);
};

BSMessage.prototype.is = function(type, name) {
    return this.action === type &&
        ((name !== undefined) ? this.name === name : true);
};

BSMessage.prototype.toString = function() {
    return JSON.stringify({
        type: this.type,
        name: this.name,
        sender: this.sender,
        receiver: this.receiver,
        data: this.data
    });
};
BSMessage.fromString = function(msg) {
    if(msg !== undefined && msg !== null) {
        if(typeof(msg) === "string") {
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
    if(name !== undefined) {
        this.name = name;
        this.save();
    }
};
/*
BSUser.prototype.getName = function () {
    if(this.name !== undefined && this.name !== null) {
        return this.name;
    } else {
        return 'Unknown User (' + this.id + ')';
    }
};
*/

BSUser.prototype.load = function () {
    if(typeof(Storage) !== "undefined") {
        var user = JSON.parse(localStorage.user);
        this.id = null;
        this.name = null;

        if(user !== undefined && user !== null) {
            if(user.id !== undefined && user.id !== null) {
                this.id = user.id;
            }

            if(user.name !== undefined) {
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
    if(typeof(Storage) !== "undefined") {
        localStorage.user = this.toString();
    } else {
        console.warn('BSUser.save: LocalStorage not available.');
    }
};

BSUser.prototype.toString = function() {
    return JSON.stringify({
        id: this.id,
        name: this.name
    });
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
    }
};
},{}],5:[function(require,module,exports){
var BSClient = require('./modules/BSClient.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var ws = null, bingo = null;

function connect() {
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
    window.setTimeout(connect, 500);
    console.log(event);
}

connect();
},{"./modules/BSClient.js":1,"./modules/BSMessage.js":2,"./modules/BSUser.js":3}]},{},[5]);
