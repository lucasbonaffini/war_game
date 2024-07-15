const { v4: uuidv4 } = require('uuid');

class Class {
    /**
     * Constructs a new Class instance.
     * @param {string} name - The name of the class.
     * @param {string} description - A brief description of the class.
     * @param {Object} attributes - The attributes and their values for the class.
     */
    constructor(id = uuidv4(), name, description, attributes = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.attributes = {
            strength: attributes.strength || 0,
            dexterity: attributes.dexterity || 0,
            intelligence: attributes.intelligence || 0,
            charisma: attributes.charisma || 0
        };
        // Add any additional custom attributes
        for (let attr in attributes) {
            if (!this.attributes.hasOwnProperty(attr)) {
                this.attributes[attr] = attributes[attr];
            }
        }
    }
}

module.exports = Class;

