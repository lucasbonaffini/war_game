const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
    constructor(id = uuidv4(), username, password, role = 'user') {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    async verifyPassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

module.exports = User;
