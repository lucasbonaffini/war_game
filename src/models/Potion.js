const { v4: uuidv4 } = require('uuid');
class Potion {
    /**
     * Constructs a new Potion instance.
     * @param {string} name - The name of the potion.
     * @param {Object} effects - The effects of the potion (e.g., { hpRestore: 50 }).
     * @param {string} usage - The usage description of the potion.
     */
    constructor(id = uuidv4(), name, effects, utility) {
        this.id = id;
        this.name = name;
        this.effects = effects;
        this.utility = utility;
    }
}

module.exports = Potion;