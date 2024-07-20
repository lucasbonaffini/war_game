const { v4: uuidv4 } = require('uuid');

class Gear {
    constructor(id = uuidv4(), name, category, armour) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.armour = armour;
    }
}

module.exports = Gear;