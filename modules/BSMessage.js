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