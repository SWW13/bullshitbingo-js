(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BSMessage = require('./BSMessage');

function BSBingo(bus, user) {
    this.bus = bus;
    this.players = [];
    this.games = [];
    this.last_words = [];
    this.user = user;

    var that = this;
    this.bus.on('messageReceived', function(msg){
        that.onMessage(msg);
    });
    this.bus.on('actionReceived', function(msg){
        that.onAction(msg);
    });
    this.bus.on('eventReceived', function(msg){
        that.onEvent(msg);
    });
    this.bus.on('dataReceived', function(msg){
        that.onData(msg);
    });
}

BSBingo.prototype.isServer = function() {
    return user.isServer();
};

BSBingo.prototype.onMessage = function(msg_data) {
    var msg = BSMessage.fromString(msg_data);

    switch(msg.type) {
        case 'event':
            return this.bus.emit('eventReceived', msg);
            break;
        case 'action':
            return this.bus.emit('actionReceived', msg);
            break;
        case 'data':
            return this.bus.emit('dataReceived', msg);
            break;

        default:
            console.warn('BSBingo.onMessage(msg): unknown type: ' + msg.type);
            return false;
            break;
    }
};
BSBingo.prototype.onAction = function(msg) {
    switch(msg.name) {
        case 'getData':
            this.bus.emit('messageSend', new BSMessage('data', 'BSBingo', this.user.id, msg.sender, this.getData()));
            break;

        case 'getUser':
            this.bus.emit('messageSend', new BSMessage('data', 'user', this.user.id, msg.sender, this.user.toString()));
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

function BSUser(server, fromString) {
    this.id = null;
    this.name = null;

    if(server !== undefined && server === true) {
        this.id = 'server';
        this.name = 'server';
    } else if(fromString === undefined || fromString === false) {
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
        localStorage.user = {
            id: this.id,
            name: this.name
        };
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

var bus = Minibus.create();
var user = new BSUser(false);
var bingo = new BSBingo(bus, user);

var ws = new WebSocket(config.websocket.url, config.websocket.protocols);
var sendEvent = null;

ws.onopen = function (event) {
    console.dir(event);

    sendEvent = bus.on('messageSend', function(msg){
        ws.send(msg.toString());
    });

    var msg = new BSMessage('action', 'getData', user.id, 'server', 'BSBingo');
    ws.send(msg.toString());
};
ws.onmessage = function (event) {
    console.dir(event);

    bingo.onMessage(event.data);
    console.dir(bingo);
}
ws.onclose = function(event) {
    console.dir(event);

    bus.off(sendEvent);
    alert('TODO: connection broken.');
}
},{"./modules/BSBingo.js":1,"./modules/BSMessage.js":2,"./modules/BSUser.js":3}]},{},[5]);
