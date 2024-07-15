const { v4: uuidv4 } = require('uuid');

class Weapon {
    constructor(id = uuidv4(), name, type, damage, unique) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.damage = damage;
        this.unique = unique;
    }
}