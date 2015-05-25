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