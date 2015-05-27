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
    document.getElementById('menu-logo').addEventListener('click', function(event){
        that.leaveGame(event);
    });
    document.getElementById('button-sendMessage').addEventListener('click', function(event){
        that.sendMessage(event);
    });
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
        case 'chat':
            this.addChatRow(msg.data.message, msg.data.user);
            break;

        case 'log':
            this.addChatRow(msg.data.message);
            break;

        default:
            console.warn('BSServer.onEvent(msg): unknown name: ' + msg.name);
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

BSClient.prototype.fromString = function(data) {
    this.games = [];

    if(data !== undefined) {
        this.games = data.games;
        this.players = data.players;
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
        content.innerHTML += templates['game-list'].render({games: this.games});

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
                var wordlist = document.getElementById('wordlist');
                if(wordlist === null) {
                    content.innerHTML = templates['words'].render({last_words: this.last_words});
                    wordlist = document.getElementById('wordlist')
                }
                wordlist.innerHTML = templates['wordlist'].render({words: this.game.words});
                var word = document.getElementById('word');
                word.focus();
                var button_addWord = document.getElementById('button-addWord');
                button_addWord.addEventListener('click', function(event){
                    event.preventDefault();
                    that.addWord(document.getElementById('word').value);
                    document.getElementById('word').value = '';
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

            case 'bingo':
                content.innerHTML = templates['bingo-board'].render({lines: this.getBoard()});
                content.innerHTML += templates['bingo-board-overview'].render({players: this.getBoardOverview()});

                var button_buzzWord = document.getElementsByClassName('button-buzzWord');
                for(var i = 0; i < button_buzzWord.length; i++) {
                    button_buzzWord[i].addEventListener('click', function(event){
                        event.preventDefault();
                        that.buzzWord(this.dataset.word);
                    });
                }
                break;

            default:
                console.warn('Uknown stage: ' + this.game.stage);
                break;
        }
    }
};

BSClient.prototype.sendMessage = function(event) {
    this.setUsername();
    var message = document.getElementById('message');
    this.ws.send(new BSMessage('event', 'chat', this.user.id, 'server', message.value));
    message.value = '';
};
BSClient.prototype.addChatRow = function(message, user_id) {
    var chat_table = document.getElementById('chat-table');
    var row = chat_table.insertRow(-1);
    var cell_time = row.insertCell(0);
    var cell_user = row.insertCell(1);
    var cell_message = row.insertCell(2);
    var d = new Date();

    cell_time.innerHTML = '<i>' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</i>';

    if(user_id !== undefined) {
        cell_user.innerHTML = '<b>' + this.players[user_id].name + ':</b> ';
        cell_message.innerHTML = message;
    } else {
        cell_message.innerHTML = '<i>' + message + '</i>';
    }

    var chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;
};

BSClient.prototype.setUsername = function() {
    while(typeof(this.user.name) !== "string" || this.user.name.length < 1) {
        var name = prompt('Please enter your username:');

        if(typeof(name) === "string") {
            this.user.setName(name);
            this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());
        }
    }
}

BSClient.prototype.createGame = function() {
    var username = document.getElementById('username').value;
    var name = document.getElementById('game').value;
    var width = document.getElementById('width').value;
    var height = document.getElementById('height').value;

    this.user.setName(username);
    this.ws.send(new BSMessage('data', 'user', this.user.id, 'server', this.user.toObject()).toString());

    var game = {
        name: name,
        width: width,
        height: height
    };

    this.ws.send(new BSMessage('event', 'newGame', this.user.id, 'server', game));
    this.render();
};
BSClient.prototype.joinGame = function(event) {
    this.setUsername();
    var game_id = event.target.dataset.id;
    this.ws.send(new BSMessage('event', 'joinGame', this.user.id, 'server', {game_id: game_id}));
};
BSClient.prototype.leaveGame = function(event) {
    this.game = null;
    this.ws.send(new BSMessage('event', 'leaveGame', this.user.id, 'server'));
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
BSClient.prototype.buzzWord = function(word) {
    if(word !== '') {
        this.ws.send(new BSMessage('event', 'buzzWord', this.user.id, 'server', {game_id: this.game.id, word: word}));
        this.render();
    }
};
BSClient.prototype.getBoard = function() {
    return this.getLines(this.game.boards[this.user.id]);
};
BSClient.prototype.getBoardOverview = function() {
    var players = this.game.players;
    var boards = [];

    for(var i = 0; i < players.length; i++) {
        boards.push({
            id: players[i],
            name: this.players[players[i]].name,
            lines: this.getLines(this.game.boards[players[i]])
        });
    }

    return boards;
};
BSClient.prototype.getLines = function(board) {
    var lines = [];
    var line = [];

    if(board !== undefined) {
        for(var i = 0; i < board.length; i++) {
            if(i % this.game.width === 0 && i > 0) {
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