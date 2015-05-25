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