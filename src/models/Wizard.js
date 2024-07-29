
const Character = require('./Character');

class Wizard extends Character {
    /**
     * Constructs a new Wizard instance.
     * @param {string} id - The unique identifier for the character.
     * @param {string} name - The name of the character.
     * @param {string} race - The race of the character.
     * @param {Class} characterClass - The class of the character.
     * @param {Array} [gear=[]] - The gear equipped by the character.
     * @param {Array} [potions=[]] - The potions carried by the character.
     * @param {Array} [weapons=[]] - The weapons equipped by the character.
     * @param {number} [hp=2000] - The hit points of the character.
     * @param {number} [ac=0] - The armor class of the character.
     * @param {number} [mana=1000] - The mana points of the character.
     * @param {Array} [spells=[]] - The spells known by the character.
     */
    constructor(id, name, race, classId, gear = [], potions = [], weapons = [], hp = 2000, maxHp = 2000, ac = 0, mana = 1000, maxMana = 1000, spells = []) {
        super(id, name, race, classId, gear, potions, weapons, hp, maxHp, ac);
        this.mana = mana;
        this.maxMana = maxMana;
        this.spells = spells;
    }
}

module.exports = Wizard;