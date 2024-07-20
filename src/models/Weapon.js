const { v4: uuidv4 } = require('uuid');

class Weapon {
    constructor(id = uuidv4(), name, category, damage) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.damage = damage;
        
    }
}

module.exports = Weapon;