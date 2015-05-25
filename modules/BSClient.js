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