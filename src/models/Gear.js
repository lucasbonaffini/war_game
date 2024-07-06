const { v4: uuidv4 } = require('uuid');

class Gear {
    constructor(id = uuidv4(), type, armour) {
        this.id = id;
        this.type = type;
        this.armour = armour;
    }
}