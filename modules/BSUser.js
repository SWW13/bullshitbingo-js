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