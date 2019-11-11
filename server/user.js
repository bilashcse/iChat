class Users {
    constructor() {
        this.users = [];
    }

    addUser(id, name, room) {
        const user = {
            id, name, room
        };
        this.users.push(user);
        return user;
    }

    getUserList(room) {
        const users = this.users.filter(user => user.room === room);
        return users;
    }

    getUser(id) {
        return this.users.filter(user => user.id === id);
    }

    removeUser(id) {
        const user = this.getUser(id);
        if (user) {
            this.users = this.users.filter(user => user.id !== id);
        }
        return user || null;
    }
}

module.exports = {
    Users
};