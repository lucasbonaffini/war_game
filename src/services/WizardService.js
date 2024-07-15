const Wizard = require('../models/Wizard');
const pool = require('../config/db');
const CharacterService = require('./CharacterService');
const SpellService = require('./SpellService');
const ClassService = require('./ClassService');

class WizardService {

    static async createWizard({ name, race, classId, hp, maxHp, ac, mana, maxMana }) {
        try {
            const wizard = new Wizard(undefined, name, race, classId, [], [], [], hp, maxHp, ac, mana, maxMana, []);
            await pool.query(
                'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [wizard.id, wizard.name, wizard.race, wizard.characterClass.id, wizard.hp, wizard.maxHp, wizard.ac]
            );
            await pool.query(
                'INSERT INTO wizards (character_id, mana, maxMana, spells) VALUES (?, ?, ?, ?)',
                [wizard.id, wizard.mana, wizard.maxMana, JSON.stringify(wizard.spells)]
            );
            return wizard;
        } catch (error) {
            console.error('Error creating wizard:', error);
            throw error;
        }
    }

    static async searchWizardById(id) {
        try {
            const character = await CharacterService.searchCharacterById(id);
            if (character) {
                const characterClass = await ClassService.searchClassById(character.classId);
                if (characterClass && characterClass.name === 'Wizard') {
                    const [wizardRows] = await pool.query('SELECT * FROM wizards WHERE character_id = ?', [id]);
                    if (wizardRows.length > 0) {
                        const wizardData = wizardRows[0];
                        return new Wizard(
                            character.id,
                            character.name,
                            character.race,
                            character.class_id,
                            JSON.parse(character.gear || '[]'),
                            JSON.parse(character.potions || '[]'),
                            JSON.parse(character.weapons || '[]'),
                            character.hp,
                            character.maxHp,
                            character.ac,
                            wizardData.mana,
                            wizardData.maxMana,
                            JSON.parse(wizardData.spells || '[]')
                        );
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Error finding wizard by id:', error);
            throw error;
        }
    }
    
    
    
    static async updateWizard(id, { name, race, classId, gear, potions, weapons, hp, maxHp, ac, mana, maxMana, spells }) {
        try {
            // Update general character information
            await pool.query(
                'UPDATE characters SET name = ?, race = ?, class_id = ?, gear = ?, potions = ?, weapons = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
                [name, race, classId, JSON.stringify(gear), JSON.stringify(potions), JSON.stringify(weapons), hp, maxHp, ac, id]
            );
    
            // Check if the character's class is 'Wizard' and update wizard-specific data
            const character = await CharacterService.searchCharacterById(id);
            if (character && character.characterClass.name === 'Wizard') {
                await pool.query(
                    'UPDATE wizards SET mana = ?, maxMana = ?, spells = ? WHERE character_id = ?',
                    [mana, maxMana, JSON.stringify(spells), id]
                );
            }
    
            console.log('Character updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating character:', error);
            throw error;
        }
    }
    
    
    static async deleteWizard(id) {
        try {
            await pool.query('DELETE FROM wizards WHERE character_id = ?', [id]);
            const result = await pool.query('DELETE FROM characters WHERE id = ?', [id]);
            if (result.affectedRows > 0) {
                console.log('Character deleted successfully');
                return true;
            }
            return false; // Return false if no rows were affected (character not found)
        } catch (error) {
            console.error('Error deleting character:', error);
            throw error;
        }
    }
    
    static async getAllWizards() {
        try {
            const [characterRows] = await pool.query('SELECT * FROM characters');
            const wizards = [];
    
            for (const character of characterRows) {
                const characterClass = await ClassService.searchClassById(character.class_id);
                if (characterClass && characterClass.name === 'Wizard') {
                    const [wizardRows] = await pool.query('SELECT * FROM wizards WHERE character_id = ?', [character.id]);
                    if (wizardRows.length > 0) {
                        const wizardData = wizardRows[0];
                        wizards.push(new Wizard(
                            character.id,
                            character.name,
                            character.race,
                            character.class_id,
                            JSON.parse(character.gear || '[]'),
                            JSON.parse(character.potions || '[]'),
                            JSON.parse(character.weapons || '[]'),
                            character.hp,
                            character.maxHp,
                            character.ac,
                            wizardData.mana,
                            wizardData.maxMana,
                            JSON.parse(wizardData.spells || '[]')
                        ));
                    }
                }
            }
    
            return wizards;
        } catch (error) {
            console.error('Error fetching wizards:', error);
            throw error;
        }
    }
    
     
    static async addSpell(characterId, spellId) {
        try {
            const wizard = await CharacterService.searchCharacterById(characterId);
            const spell = await SpellService.searchSpellById(spellId);
            const characterClass = await ClassService.getClassById(wizard.classId);

            if (!wizard) {
                throw new Error('Character not found');
            }

            if (!spell) {
                throw new Error('Spell not found');
            }

    
            if (!characterClass || characterClass.name !== 'Wizard') {
                throw new Error('Character is not a Wizard');
            }

            wizard.spells.push(spell);

            await pool.query('INSERT INTO wizard_spells (character_id, spell_id) VALUES (?, ?)', [characterId, spellId]);

            return wizard;
        } catch (error) {
            console.error('Error adding spell to wizard:', error);
            throw error;
        }
    }
     
    static async restoreMana(characterId) {
        try {
            const character = await CharacterService.searchCharacterById(characterId);
    
            if (!character) {
                throw new Error('Character not found');
            }
    
            
            const characterClass = await ClassService.getClassById(character.classId);
    
            if (!characterClass || characterClass.name !== 'Wizard') {
                throw new Error('Character is not a Wizard');
            }
    
            const manaPotion = character.potions.find(potion => potion.effects.manaRestore);
    
            if (!manaPotion) {
                throw new Error('No mana potions available');
            }
    
            character.mana = Math.min(character.mana + manaPotion.effects.manaRestore, character.maxMana);
    
            // Remove the potion 
            character.potions = character.potions.filter(potion => potion !== manaPotion);
    
            // Update wizard's mana in the db
            await pool.query('UPDATE wizards SET mana = ? WHERE character_id = ?', [character.mana, character.id]);
    
            // Update the character potions in the db
            await pool.query('UPDATE characters SET potions = ? WHERE id = ?', [JSON.stringify(character.potions), character.id]);
    
            return character;
        } catch (error) {
            console.error('Error restoring mana:', error);
            throw error;
        }
    }
    
    
    
}

module.exports = WizardService;