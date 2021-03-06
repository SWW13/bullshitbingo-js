var Utils = require('./Utils.js');

function BSUser() {
    this.id = Utils.generateUUID();
    this.name = null;

    this.load();
}

BSUser.prototype.setName = function (name) {
    if (name !== undefined) {
        this.name = name;
        this.save();
    }
};
BSUser.prototype.hasName = function () {
    return (typeof(this.name) === "string" && this.name.length >= 1);
};

BSUser.prototype.load = function () {
    if (typeof(Storage) !== "undefined") {
        var user = localStorage.user;
        this.id = null;
        this.name = null;

        if (user !== undefined) {
            user = JSON.parse(localStorage.user);
        }

        if (user !== undefined && user !== null) {
            if (user.id !== undefined && user.id !== null) {
                this.id = user.id;
            }

            if (user.name !== undefined) {
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
    if (typeof(Storage) !== "undefined") {
        localStorage.user = this.toString();
    } else {
        console.warn('BSUser.save: LocalStorage not available.');
    }
};

BSUser.prototype.toObject = function () {
    return {
        id: this.id,
        name: this.name
    };
};
BSUser.prototype.toString = function () {
    return JSON.stringify(this.toObject());
};

module.exports = BSUser;