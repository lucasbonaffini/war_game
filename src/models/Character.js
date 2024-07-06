const { v4: uuidv4 } = require('uuid');

class Character {
    /**
     * Constructs a new Character instance.
     * @param {string} id - The unique identifier for the character.
     * @param {string} name - The name of the character.
     * @param {string} race - The race of the character.
     * @param {Class} characterClass - The class of the character.
     * @param {Array} [bag=[]] - The inventory bag of the character.
     * @param {Array} [gear=[]] - The gear equipped by the character.
     * @param {Array} [potions=[]] - The potions carried by the character.
     * @param {Array} [weapons=[]] - The weapons equipped by the character.
     * @param {number} [hp=2000] - The hit points of the character.
     * @param {number} [ac=0] - The armor class of the character.
     */
    constructor(id = uuidv4(), name, race, characterClass, bag = [], gear = [], potions = [], weapons = [], hp = 2000, ac = 0) {
        this.id = id;
        this.name = name;
        this.race = race;
        this.characterClass = characterClass; // Expecting an instance of Class
        this.bag = bag;
        this.gear = gear;
        this.potions = potions;
        this.weapons = weapons;
        this.hp = hp;
        this.ac = ac;
    }

}

module.exports = Character;