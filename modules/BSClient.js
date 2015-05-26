var BSMessage = require('./BSMessage');
var BSUser = require('./BSUser');
var Utils = require('./Utils.js');

function BSClient(ws) {
    this.ws = ws;
    this.games = [];
    this.last_words = [];
    this.user = new BSUser();
    this.game = null;

    this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());
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
        case 'bingo':
            this.fromString(msg.data);
            this.render();
            console.log(this);
            break;

        default:
            console.warn('BSClient.onData(msg): unknown name: ' + msg.name);
            return false;
            break;
    }
};

BSClient.prototype.fromString = function(data) {
    this.games = {};

    if(data !== undefined) {
        for(var i = 0; i < data.games.length; i++){
            this.games[data.games[i].id] = data.games[i];
        }

        if(this.game !== null) {
            this.game = this.games[this.game.id];
        }

        this.last_words = data.last_words;
    }
};
BSClient.prototype.toString = function() {
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

BSClient.prototype.render = function() {
    var that = this;
    var content = document.getElementById('content');
    var navbar = document.getElementById('navbar');

    navbar.innerHTML = templates['navbar'].render({game: this.game});

    if(this.game === null) {
        content.innerHTML = templates['create-game'].render({username: this.user.name});
        content.innerHTML += templates['game-list'].render({games: this.toString().games});

        var create_game = document.getElementById('create-game');
        create_game.addEventListener('click', function(event){
            that.createGame(event);
        });
        var button_join = document.getElementsByClassName('button-join');
        for(var i = 0; i < button_join.length; i++) {
            button_join[i].addEventListener('click', function(event){
                that.joinGame(event);
            });
        }
    }
    else {
        switch(this.game.stage) {
            case 'words':
                content.innerHTML = templates['word-list'].render({words: this.game.words, last_words: this.last_words});
                var button_addWord = document.getElementById('button-addWord');
                button_addWord.addEventListener('click', function(event){
                    that.addWord(document.getElementById('word').value);
                });
                var button_addLastWord = document.getElementsByClassName('button-addLastWord');
                for(var i = 0; i < button_addLastWord.length; i++) {
                    button_addLastWord[i].addEventListener('click', function(event){
                        that.addWord(this.dataset.word);
                    });
                }
                var button_removeWord = document.getElementsByClassName('button-removeWord');
                for(var i = 0; i < button_removeWord.length; i++) {
                    button_removeWord[i].addEventListener('click', function(event){
                        that.removeWord(this.dataset.word);
                        console.log(event);
                    });
                }
                break;

            default:
                console.warn('Uknown stage: ' + this.game.stage);
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
        stage: 'words',
        words: [],
        players: [this.user.toObject()],
        user: this.user.toObject()
    };

    this.ws.send(new BSMessage('event', 'newGame', this.user.id, 'server', this.game));
    this.render();
};
BSClient.prototype.joinGame = function(event) {
    this.game = this.games[event.target.dataset.id];
    this.ws.send(new BSMessage('event', 'joinGame', this.user.id, 'server', {game_id: this.game.id}));
    this.render();
};
BSClient.prototype.addWord = function(word) {
    if(word !== '') {
        this.ws.send(new BSMessage('event', 'addWord', this.user.id, 'server', {game_id: this.game.id, word: word}));
        this.render();
    }
};
BSClient.prototype.removeWord = function(word) {
    this.ws.send(new BSMessage('event', 'removeWord', this.user.id, 'server', {game_id: this.game.id, word: word}));
    this.render();
};

module.exports = BSClient;