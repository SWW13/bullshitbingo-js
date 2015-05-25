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