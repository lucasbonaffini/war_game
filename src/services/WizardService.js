const Wizard = require('../models/Wizard');
const pool = require('../config/db');
const CharacterService = require('./CharacterService');
const SpellService = require('./SpellService');
const ClassService = require('./ClassService');


class WizardService {
    static async createWizard({ name, race, classId, hp, maxHp, ac, mana = 1000, maxMana = 1000 }) {
        const connection = await pool.getConnection();
        try {
            const wizardClass = await ClassService.searchClassById(classId);

            if (wizardClass.name.toLowerCase() !== 'wizard') {
                throw new Error('Invalid class ID for Wizard');
            }
            
            const character = await CharacterService.createCharacter({ name, race, classId, hp, maxHp, ac });

            if (!character) {
                throw new Error('Error creating character for wizard');
            }

            
            const result = await connection.query(
                'INSERT INTO wizards (character_id, mana, maxMana) VALUES (?, ?, ?)',
                [character.id, mana, maxMana]
            );
            console.log('Inserted into database:', result);

            const wizard = new Wizard(
                character.id, character.name, character.race, character.classId, character.gear,
                character.potions, character.weapons, character.hp, character.maxHp, character.ac, mana, maxMana
            );
            console.log('Created wizard object:', wizard);
           
            return wizard;
        } catch (error) {
            console.error('Error creating wizard:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async searchWizardById(id) {
        try {
            const character = await CharacterService.searchCharacterById(id);

            const wizardClass = await ClassService.searchClassById(character.classId);
    
            if (!character || wizardClass.name.toLowerCase() !== 'wizard') {
                return null;
            }
    
            const [wizardRows] = await pool.query('SELECT * FROM wizards WHERE character_id = ?', [id]);
            if (wizardRows.length === 0) {
                return null;
            }
    
            const wizardData = wizardRows[0];
    
            // Fetch spells associated with the wizard
            const [spellsRows] = await pool.query(`
                SELECT s.* FROM spells s
                INNER JOIN wizard_spells ws ON s.id = ws.spell_id
                WHERE ws.character_id = ?`, [id]);
            
            // Map the spell data to Spell instances
            const spells = spellsRows.map(spellData => new Spell(
                spellData.id,
                spellData.name,
                spellData.description,
                spellData.manaCost,
                spellData.damage,
                spellData.duration
            ));
    
            return {
                ...character,
                mana: wizardData.mana,
                maxMana: wizardData.maxMana,
                spells: spells
            };
    
        } catch (error) {
            console.error('Error finding wizard by id:', error);
            throw error;
        }
    }
    

    static async updateWizard(id, { name, race, classId, gear, potions, weapons, spells, hp, maxHp, ac, mana, maxMana }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            
            const result = await CharacterService.updateCharacter(id, { name, race, classId, gear, potions, weapons, hp, maxHp, ac });

            const wizardClass = await ClassService.searchClassById(classId);
            if (!wizardClass || wizardClass.name.toLowerCase() !== 'wizard') {
                throw new Error('Invalid class ID for Wizard');
            }

          
            await connection.query(
                'UPDATE wizards SET mana = ?, maxMana = ? WHERE character_id = ?',
                [mana, maxMana, id]
            );

            
            await connection.query('DELETE FROM wizard_spells WHERE character_id = ?', [id]);
            for (const spell of spells) {
                await connection.query(
                    'INSERT INTO wizard_spells (character_id, spell_id) VALUES (?, ?)',
                    [id, spell.id]
                );
            }

            await connection.commit();

            
            return {
                ...result,
                mana,
                maxMana,
                spells
            };
        } catch (error) {
            await connection.rollback();
            console.error('Error updating wizard:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    
    static async deleteWizard(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('DELETE FROM wizard_spells WHERE character_id = ?', [id]);
            
            await connection.query('DELETE FROM wizards WHERE character_id = ?', [id]);

            await CharacterService.deleteCharacter(id);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Error deleting wizard:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
    
    static async getAllWizards() {
        const connection = await pool.getConnection();
        try {
            
            const characters = await CharacterService.getAllCharacters();

            
            const [wizardsRows] = await connection.query('SELECT * FROM wizards');

            
            const [spellsRows] = await connection.query(`
                SELECT ws.character_id, s.* 
                FROM spells s
                JOIN wizard_spells ws ON s.id = ws.spell_id
            `);

            // Crear un mapa de hechizos por wizard
            const spellsMap = spellsRows.reduce((acc, spellRow) => {
                if (!acc[spellRow.character_id]) {
                    acc[spellRow.character_id] = [];
                }
                acc[spellRow.character_id].push(new Spell(
                    spellRow.id,
                    spellRow.name,
                    spellRow.description,
                    spellRow.manaCost,
                    spellRow.damage,
                    spellRow.duration
                ));
                return acc;
            }, {});

           
            const wizards = characters
                .filter(character => wizardsRows.some(wizard => wizard.character_id === character.id))
                .map(character => {
                    const wizardData = wizardsRows.find(wizard => wizard.character_id === character.id);
                    return {
                        ...character,
                        mana: wizardData.mana,
                        maxMana: wizardData.maxMana,
                        spells: spellsMap[character.id] || []
                    };
                });

            return wizards;
        } catch (error) {
            console.error('Error fetching all wizards:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
    

    

    static async addSpell(wizardId, spellId) {
        try {
            const wizard = await WizardService.searchWizardById(wizardId);
            const spell = await SpellService.searchSpellById(spellId);
    
            if (!wizard) {
                throw new Error('Wizard not found');
            }
    
            if (!spell) {
                throw new Error('Spell not found');
            }

    
            
            const [rows] = await pool.query(
                'SELECT * FROM wizard_spells WHERE character_id = ? AND spell_id = ?',
                [wizardId, spellId]
            );
    
            if (rows.length > 0) {
                throw new Error('Spell already added to this character');
            }
    
            // add the spell
            await pool.query(
                'INSERT INTO wizard_spells (character_id, spell_id) VALUES (?, ?)',
                [wizardId, spellId]
            );
    
            // Update the object wizard
            wizard.spells.push(spell);
    
            return wizard;
        } catch (error) {
            console.error('Error adding potion to character:', error);
            throw error;
        }
    }

    static async castSpell(attackerId, targetId, spellId) {
        try {
    
            const wizard = await WizardService.searchWizardById(attackerId);
            const spell = await SpellService.searchSpellById(spellId);
    
            if (!wizard || !spell) {
                throw new Error('Wizard or Spell not found');
            }
    
            const wizardSpell = wizard.spells.find(s => s.id === spellId);
    
            if (!wizardSpell) {
                throw new Error('Spell not found or does not belong to the attacker');
            }
    
            // Check if the wizard has enough mana to cast the spell
            if (wizard.mana < spell.manaCost) {
                throw new Error('Not enough mana to cast the spell');
            }
    
            let damageDealt = spell.damage;
    
            // Apply duration-based damage if applicable
            if (spell.duration) {
                // Example: damage applied over multiple turns
                damageDealt *= spell.duration;
            }
    
            // Apply damage to the target
            const target = await CharacterService.searchCharacterById(targetId);
            if (!target) {
                throw new Error('Target not found');
            }
    
            target.hp -= damageDealt;
            if (target.hp < 0) {
                target.hp = 0; // Ensure HP doesn't go negative
            }
    
            // Check if the target is dead
            const isDead = target.hp === 0;
            
    
            await connection.query('UPDATE characters SET hp = ? WHERE id = ?', [target.hp, target.id]);
    
            // Deduct mana from the wizard
            wizard.mana -= spell.manaCost;
            if (wizard.mana < 0) wizard.mana = 0; // Ensure mana doesn't go negative
    
            await connection.query('UPDATE wizards SET mana = ? WHERE character_id = ?', [wizard.mana, wizard.id]);
    
            await connection.commit();
    
            // Construct the message
            let message = `${wizard.name} cast ${spell.name} on ${target.name}, dealing ${damageDealt} damage`;
    
            if (isDead) {
                message += `. ${target.name} has been defeated.`;
            }
    
            return { message };
    
        } catch (error) {
            console.error('Error during spell casting:', error);
            throw error;
        }
    }

    static async restoreMana(wizardId) {
        try {
            const wizard = WizardService.searchWizardById(wizardId)

            if(!wizard) {
                throw new Error('Wizard not found')
            }
    
            const manaPotion = wizard.potions.find(potion => potion.effects.manaRestore);
    
            if (!manaPotion) {
                throw new Error('No mana potions available');
            }
    
            if (wizard.mana === wizard.maxMana) {
              throw new Error('Your Mana is full! Keep combat wizard')
            }

            wizard.mana = Math.min(wizard.mana + manaPotion.effects.manaRestore, wizard.maxMana)

            // Remove the used potion from the character's potions array
            wizard.potions = wizard.potions.filter(potion => potion !== manaPotion);

            await pool.query('UPDATE wizards SET mana = ? WHERE id = ?', [wizard.mana, wizard.id])

             // Update the character's potions in the database
             await pool.query('UPDATE characters SET potions = ? WHERE id = ?', [JSON.stringify(wizard.potions), wizard.id]);

             return wizard;

        } catch (error) {
            console.error('Error restoring wizard mana: ', error)
            throw error;
        }
        

    }
    
}

module.exports = WizardService;