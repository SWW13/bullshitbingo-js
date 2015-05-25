(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BSMessage = require('./BSMessage');

function BSBingo(user) {
    this.players = [];
    this.games = [];
    this.last_words = [];
    this.user = user;
}

BSBingo.prototype.isServer = function() {
    return user.isServer();
};

BSBingo.prototype.onMessage = function(msg_data) {
    var msg = BSMessage.fromString(msg_data);

    if(msg.isEmpty()) {
        console.warn('BSBingo.onMessage(msg): empty message');
        return false;
    }

    switch(msg.type) {
        case 'action':
            return this.onAction(msg);
            break;
        case 'event':
            return this.onEvent(msg);
            break;
        case 'data':
            return this.onData(msg);
            break;

        default:
            console.warn('BSBingo.onMessage(msg): unknown type: ' + msg.type);
            return false;
            break;
    }
};
BSBingo.prototype.onAction = function(msg) {
    switch(msg.action) {
        case 'getData':
            return new BSMessage('data', 'BSBingo', this.user, this.getData());
            break;

        default:
            console.warn('BSBingo.onAction(msg): unknown action: ' + msg.action);
            return false;
            break;
    }
};
BSBingo.prototype.onEvent = function(msg) {
    return false;
};
BSBingo.prototype.onData = function(msg) {
    return false;
};

BSBingo.prototype.getData = function() {
    return {
        games: this.games,
        last_words: this.last_words
    };
};

module.exports = BSBingo;
},{"./BSMessage":2}],2:[function(require,module,exports){
function BSMessage(type, action, user, data) {
    this.type = 'unknown';
    this.action = 'unknown';
    this.sender = 'unknown';
    this.data = null;

    if(type !== undefined) {
        this.type = type;
    }
    if(action !== undefined) {
        this.action = action;
    }
    if(user !== undefined && user !== null && user.id !== undefined) {
        this.sender = user.id;
    }
    if(data !== undefined) {
        this.data = data;
    }
}

BSMessage.prototype.isEmpty = function() {
    return (this.data !== null && this.data !== undefined);
};

BSMessage.prototype.toString = function() {
    return JSON.stringify({
        type: this.type,
        action: this.action,
        sender: this.sender,
        data: this.data
    });
};
BSMessage.fromString = function(msg) {
    if(msg !== undefined && msg !== null) {
        if(typeof(msg) === "string") {
            msg = JSON.parse(msg);
        }
        return new BSMessage(msg.type, msg.action, msg.sender, msg.data);
    } else {
        console.warn('BSMessage: empty message');
        console.log(msg);
        return null;
    }
}

module.exports = BSMessage;
},{}],3:[function(require,module,exports){
var Utils = require('./Utils.js');

function BSUser(server) {
    this.id = null;
    this.name = null;

    if(server !== undefined && server === true) {
        this.id = 'server';
        this.name = 'server';
    } else {
        this.load();
    }
}

BSUser.prototype.isServer = function () {
    return this.id === 'server';
};

BSUser.prototype.setName = function (name) {
    if(name !== undefined) {
        this.name = name;
        this.save();
    }
};
BSUser.prototype.getName = function () {
    if(this.name !== undefined && this.name !== null) {
        return this.name;
    } else {
        return 'Unknown User (' + this.id + ')';
    }
};

BSUser.prototype.load = function () {
    if(typeof(Storage) !== "undefined") {
        var user = localStorage.user;

        if(user !== undefined && user !== null) {
            if(user.id !== undefined && user.id !== null) {
                this.id = user.id;
            } else {
                this.id = Utils.generateUUID();
                console.log('BSUser: created new user uuid: ' + this.id);
            }

            if(user.name !== undefined) {
                this.name = user.name;
            } else {
                this.name = null;
            }
        }
    } else {
        console.warn('BSUser.load: LocalStorage not available.');
    }
};
BSUser.prototype.save = function () {
    if(typeof(Storage) !== "undefined") {
        localStorage.user = {
            id: this.id,
            name: this.name
        };
    } else {
        console.warn('BSUser.save: LocalStorage not available.');
    }
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
    }
};
},{}],5:[function(require,module,exports){
var BSBingo = require('./modules/BSBingo.js');
var BSUser = require('./modules/BSUser.js');
var BSMessage = require('./modules/BSMessage.js');

var user = new BSUser(false);
var bingo = new BSBingo(user);

var ws = new WebSocket(config.websocket.url, config.websocket.protocols);

ws.onopen = function (event) {
    console.dir(event);

    var msg = new BSMessage('action', 'getData', user, null);
    console.dir(msg);
    ws.send(msg);
};
ws.onmessage = function (event) {
    console.dir(event);

    bingo.onMessage(JSON.parse(event.data));
    console.dir(bingo);
}
},{"./modules/BSBingo.js":1,"./modules/BSMessage.js":2,"./modules/BSUser.js":3}]},{},[5]);
