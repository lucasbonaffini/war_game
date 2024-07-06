class Potion {
    /**
     * Constructs a new Potion instance.
     * @param {string} name - The name of the potion.
     * @param {Object} effects - The effects of the potion (e.g., { hpRestore: 50 }).
     * @param {string} usage - The usage description of the potion.
     */
    constructor(name, effects, usage) {
        this.name = name;
        this.effects = effects;
        this.usage = usage;
    }
}