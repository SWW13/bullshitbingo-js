var Utils = require('./Utils.js');

function BSGame(name, width, height, data) {
    this.id = Utils.generateUUID();
    this.name = "Round 1";
    this.width = 5;
    this.height = 5;
    this.players = [];
    this.words = [];
    this.stage = 'words';
}

BSGame.prototype.isEmpty = function() {
    return (this.data !== null && this.data !== undefined);
};

BSGame.prototype.toString = function() {
    return JSON.stringify({
        type: this.type,
        action: this.action,
        sender: this.sender,
        data: this.data
    });
};
BSGame.fromString = function(msg) {
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

module.exports = BSGame;