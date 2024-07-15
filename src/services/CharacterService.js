const Character = require('../models/Character')
const pool = require('../config/db');
const PotionService = require('../services/PotionService');

class CharacterService {
    static async createCharacter({name, race, classId, hp, maxHp, ac }) {
      try {
        // Create a new Character instance using the model constructor
        const character = new Character(undefined, name, race, classId, [], [], [], hp, maxHp, ac);
  
        const result = await pool.query(
          'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [character.id, character.name, character.race, character.classId, character.hp, character.maxHp, character.ac]
        );
            console.log('Character created successfully:', result);
            return character;
      } catch (error) {
            console.error('Error creating character:', error);
            throw error;
      }
    }
    static async searchCharacterById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM characters WHERE id = ?', [id]);
            if(rows.length > 0) {
                const character = rows[0];
                return new Character(
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
                );
            }
            return null;
        } catch(error) {
            console.log('Error finding character by id: ',error)
            throw error;
        }
    }
    static async updateCharacter(id, { name, race, classId, gear, potions, weapons, hp, maxHp, ac }) {
        try {
          const result = await pool.query(
            'UPDATE characters SET name = ?, race = ?, class_id = ?, gear = ?, potions = ?, weapons = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
            [name, race, classId, JSON.stringify(gear), JSON.stringify(potions), JSON.stringify(weapons), hp, maxHp, ac, id]

          );
          if (result.affectedRows > 0) {
            console.log('Character updated successfully');
            return true;
          }
            return false; // Return false if no rows were affected (character not found)
        } catch (error) {
            console.error('Error updating character:', error);
            throw error;
        }
      }
      static async deleteCharacter(id) {
        try {
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
      static async getAllCharacters() {
        try {
          const [rows] = await pool.query('SELECT * FROM characters');
          const characters = rows.map(character => new Character(
            character.id,
            character.name,
            character.race,
            character.class_id,
            JSON.parse(character.gear || '[]'),
            JSON.parse(character.weapons) || '[]',
            JSON.parse(character.potions) || '[]',
            character.hp,
            character.maxHp,
            character.ac
          ));
            return characters;
        } catch (error) {
            console.error('Error fetching characters:', error);
            throw error;
        }
      }

      static async attack(attackerId, targetId, weaponId) {
        try {
            const attacker = await CharacterService.searchCharacterById(attackerId);
            const target = await CharacterService.searchCharacterById(targetId);
            
            if (!attacker || !target) {
                throw new Error('Character not Found');
            }

            const weapon = attacker.weapons.find(w => w.id === weaponId);

            if (!weapon) {
                throw new Error('Weapon not found or does not belong to the attacker');
            }

            let damageDealt = weapon.damage;
            
            // if the target's AC is greater or equal than the weapon damage, reduce de damage by half
            if (target.ac >= weapon.damage) {
                damageDealt /= 2;
            }

            if (attacker.characterClass.name === 'Barbarian') {
                damageDealt += attacker.characterClass.attributes.strength;
            }

            if (attacker.characterClass.name === 'Rogue') {
                damageDealt += attacker.characterClass.attributes.dexterity;
            }

            target.hp -= damageDealt;

            await pool.query('UPDATE characters SET hp = ? WHERE id = ?', [target.hp, target.id]);

            return {
                message: `${attacker.name} attacked ${target.name} with ${weapon.name}, dealing ${weapon.damage}`
            }

        } catch (error) {
            console.error("Error during attack: ", error);
            throw error;
        }
      }
      static async addPotion(characterId, potionId) {
        try {
        
            const character = await CharacterService.searchCharacterById(characterId);
            const potion = await PotionService.searchPotionById(potionId);

            if(!character) {
                throw new Error('Character not found')
            }

            if(!potion) {
                throw new Error('Potion not found')
            }

            character.potions.push(potion);

            await pool.query('INSERT INTO character_potions (character_id, potion_id) VALUES (?, ?)',
                [characterId, potionId]
            );

            return character;
      } catch (error) {
        console.error('Error adding potion to character: ', error)
        throw error;
      }
    }

    static async heal(characterId) {
        try {
            const character = await CharacterService.searchCharacterById(characterId);
    
            if (!character) {
                throw new Error('Character not found');
            }
    
            const healingPotion = character.potions.find(potion => potion.effects.hpRestore);
    
            if (!healingPotion) {
                throw new Error('No healing potions available');
            }
    
            character.hp = Math.min(character.hp + healingPotion.effects.hpRestore, character.maxHp);
    
            // Remove the used potion from the character's potions array
            character.potions = character.potions.filter(potion => potion !== healingPotion);
    
            // Update the character's HP in the database
            await pool.query('UPDATE characters SET hp = ? WHERE id = ?', [character.hp, character.id]);
    
            // Update the character's potions in the database
            await pool.query('UPDATE characters SET potions = ? WHERE id = ?', [JSON.stringify(character.potions), character.id]);
    
            return character;
        } catch (error) {
            console.error('Error healing character:', error);
            throw error;
        }
    }
        
    
    
    
  }
  
  module.exports = CharacterService;
