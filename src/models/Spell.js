const { v4: uuidv4 } = require('uuid');


class Spell {
    /**
     * Constructs a new Spell instance.
     * @param {string} name - The name of the spell.
     * @param {string} description - A brief description of the spell.
     * @param {number} manaCost - The mana cost of casting the spell.
     * @param {number} damage - The damage dealt by the spell (if applicable).
     * @param {number} duration - The duration of the spell effect (if applicable).
     */
    constructor(id = uuidv4(), name, description, manaCost, damage = 0, duration = 0) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.manaCost = manaCost;
        this.damage = damage;
        this.duration = duration;
    }
}

module.exports = Spell;