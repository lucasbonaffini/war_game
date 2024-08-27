const Character = require('../models/Character');
const Weapon = require('../models/Weapon');
const Gear = require('../models/Gear');
const Potion = require('../models/Potion');
const PotionService = require('../services/PotionService');
const ClassService = require('./ClassService');
const WeaponService = require('./WeaponService');
const GearService = require('./GearService');
const pool = require('../config/db');

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
          // Query for the character
          const [characterRows] = await pool.query('SELECT * FROM characters WHERE id = ?', [id]);
          if (characterRows.length === 0) {
              return null;
          }
  
          const characterData = characterRows[0];
  
          // Create the character instance
          const character = new Character(
              characterData.id,
              characterData.name,
              characterData.race,
              characterData.class_id,
              [], // Empty gear array, will populate below
              [], // Empty potions array, will populate below
              [], // Empty weapons array, will populate below
              characterData.hp,
              characterData.maxHp,
              characterData.ac
          );
  
          // Fetch and add potions
          const [potionRows] = await pool.query(`
              SELECT p.* FROM potions p
              INNER JOIN character_potions cp ON p.id = cp.potion_id
              WHERE cp.character_id = ?`, [id]);
  
          character.potions = potionRows.map(potionData => new Potion(
              potionData.id,
              potionData.name,
              JSON.parse(potionData.effects),
              potionData.utility
          ));
  
          // Fetch and add gear
          const [gearRows] = await pool.query(`
              SELECT g.* FROM gears g
              INNER JOIN character_gear cg ON g.id = cg.gear_id
              WHERE cg.character_id = ?`, [id]);
  
          character.gear = gearRows.map(gearData => new Gear(
              gearData.id,
              gearData.name,
              gearData.category,
              gearData.armour
          ));
  
          // Fetch and add weapons
          const [weaponRows] = await pool.query(`
              SELECT w.* FROM weapons w
              INNER JOIN character_weapons cw ON w.id = cw.weapon_id
              WHERE cw.character_id = ?`, [id]);
  
          character.weapons = weaponRows.map(weaponData => new Weapon(
              weaponData.id,
              weaponData.name,
              weaponData.category,
              weaponData.damage
          ));
          
          return character;
      } catch (error) {
          console.error('Error finding character by id:', error);
          throw error;
      }
  }
  

    static async updateCharacter(id, { name, race, classId, gear, potions, weapons, hp, maxHp, ac }) {
      const connection = await pool.getConnection();
      try {
          await connection.beginTransaction();
  
          // Update character main details
          const [result] = await connection.query(
              'UPDATE characters SET name = ?, race = ?, class_id = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
              [name, race, classId, hp, maxHp, ac, id]
          );
  
          if (result.affectedRows === 0) {
              throw new Error('Character not found');
          }
  
          // Update character's gear
          await connection.query('DELETE FROM character_gear WHERE character_id = ?', [id]);
          for (const gearItem of gear) {
              await connection.query('INSERT INTO character_gear (character_id, gear_id) VALUES (?, ?)', [id, gearItem.id]);
          }
  
          // Update character's potions
          await connection.query('DELETE FROM character_potions WHERE character_id = ?', [id]);
          for (const potion of potions) {
              await connection.query('INSERT INTO character_potions (character_id, potion_id) VALUES (?, ?)', [id, potion.id]);
          }
  
          // Update character's weapons
          await connection.query('DELETE FROM character_weapons WHERE character_id = ?', [id]);
          for (const weapon of weapons) {
              await connection.query('INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)', [id, weapon.id]);
          }
  
          await connection.commit();
          console.log('Character updated successfully');
          return true;
      } catch (error) {
          await connection.rollback();
          console.error('Error updating character:', error);
          throw error;
      } finally {
          connection.release();
      }
  }
  

  static async deleteCharacter(id) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Delete from join tables
        await connection.query('DELETE FROM character_gear WHERE character_id = ?', [id]);
        await connection.query('DELETE FROM character_potions WHERE character_id = ?', [id]);
        await connection.query('DELETE FROM character_weapons WHERE character_id = ?', [id]);

        // Delete from characters table
        const [result] = await connection.query('DELETE FROM characters WHERE id = ?', [id]);

        await connection.commit();

        if (result.affectedRows > 0) {
            console.log('Character deleted successfully');
            return true;
        }
        return false; // Return false if no rows were affected (character not found)
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting character:', error);
        throw error;
    } finally {
        connection.release();
    }
  }


  static async getAllCharacters() {
    try {
        const [characterRows] = await pool.query('SELECT * FROM characters');

        const [gearRows] = await pool.query(`
            SELECT cg.character_id, g.*
            FROM character_gear cg
            JOIN gears g ON cg.gear_id = g.id
        `);

        const [potionRows] = await pool.query(`
            SELECT cp.character_id, p.*
            FROM character_potions cp
            JOIN potions p ON cp.potion_id = p.id
        `);

        const [weaponRows] = await pool.query(`
            SELECT cw.character_id, w.*
            FROM character_weapons cw
            JOIN weapons w ON cw.weapon_id = w.id
        `);

        const characters = characterRows.map(character => {
            return {
                ...character,
                gear: gearRows.filter(g => g.character_id === character.id).map(g => ({
                    id: g.id,
                    name: g.name,
                    category: g.category,
                    armour: g.armour
                    
                })),
                potions: potionRows.filter(p => p.character_id === character.id).map(p => ({
                    id: p.id,
                    name: p.name,
                    effects: p.effects,
                    utility: p.utility
                    
                })),
                weapons: weaponRows.filter(w => w.character_id === character.id).map(w => ({
                    id: w.id,
                    name: w.name,
                    category: w.category,
                    damage: w.damage
                    
                }))
            };
        });

          return characters;
      } catch (error) {
          console.error('Error fetching all characters:', error);
          throw error;
      }
    }


    static async addWeapon(characterId, weaponId) {
        try {
            const character = await CharacterService.searchCharacterById(characterId);
            const weapon = await WeaponService.searchWeaponById(weaponId);
    
            if (!character) {
                throw new Error('Character not found');
            }
    
            if (!weapon) {
                throw new Error('Weapon not found');
            }

            const [rows] = await pool.query(
                'SELECT * FROM character_weapons WHERE character_id = ? AND weapon_id = ?',
                [characterId, weaponId]
            );
    
            if (rows.length > 0) {
                throw new Error('Weapon already added to this character');
            }
    
            await pool.query('INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)', [characterId, weaponId]);

            character.weapons.push(weapon);
    
            return character;
        } catch (error) {
            console.error('Error adding weapon to character: ', error);
            throw error;
        }
    }

    static async addGear(characterId, gearId) {
        try {
            const character = await CharacterService.searchCharacterById(characterId);
            const gear = await GearService.searchGearById(gearId);
    
            if (!character) {
                throw new Error('Character not found');
            }
    
            if (!gear) {
                throw new Error('Gear not found');
            }
    
            const [rows] = await pool.query(
                'SELECT * FROM character_gear WHERE character_id = ? AND gear_id = ?',
                [characterId, gearId]
            );
    
            if (rows.length > 0) {
                throw new Error("Weapon already exists in character's inventory");
            }
    
            // Add the gear to the character
            await pool.query('INSERT INTO character_gear (character_id, gear_id) VALUES (?, ?)', [characterId, gearId]);
    
            // Update the character's AC based on gear type
            let additionalAC = 0;
            switch (gear.category.toLowerCase()) {
                case 'chestplate':
                    additionalAC = 400;
                    break;
                case 'cleats':
                    additionalAC = 100;
                    break;
                case 'leggings':
                    additionalAC = 200;
                    break;
                case 'skullcap':
                    additionalAC = 300;
                    break;
            }
    
            // Ensure the new AC does not exceed 1000
            const newAC = Math.min(character.ac + additionalAC, 1000);
    
            // Update the character's AC in the database
            await pool.query('UPDATE characters SET ac = ? WHERE id = ?', [newAC, characterId]);
    
            // Update the character object
            character.gear.push(gear);
            character.ac = newAC;
    
            return character;
        } catch (error) {
            console.error('Error adding gear to character: ', error);
            throw error;
        }
    }
    
    
    static async addPotion(characterId, potionId) {
        try {
            const character = await CharacterService.searchCharacterById(characterId);
            const potion = await PotionService.searchPotionById(potionId);
    
            if (!character) {
                throw new Error('Character not found');
            }
    
            if (!potion) {
                throw new Error('Potion not found');
            }
    
            // check if the potion is already added
            const [rows] = await pool.query(
                'SELECT * FROM character_potions WHERE character_id = ? AND potion_id = ?',
                [characterId, potionId]
            );
    
            if (rows.length > 0) {
                throw new Error("Potion already exists in character's inventory");
            }
    
            // add the potion
            await pool.query(
                'INSERT INTO character_potions (character_id, potion_id) VALUES (?, ?)',
                [characterId, potionId]
            );
    
            // Update the object character
            character.potions.push(potion);
    
            return character;
        } catch (error) {
            console.error('Error adding potion to character:', error);
            throw error;
        }
    }
    
    static async attack(attackerId, targetId, weaponId) {
        try {
            const attacker = await CharacterService.searchCharacterById(attackerId);
            const target = await CharacterService.searchCharacterById(targetId);
            const attackerClass = await ClassService.searchClassById(attacker.classId)
            

            if (!attacker || !target) {
                throw new Error('Character not Found');
            }

            const weapon = attacker.weapons.find(w => w.id === weaponId);

            if (!weapon) {
                throw new Error('Weapon not found or does not belong to the attacker');
            }

            
            let initialDamage = weapon.damage;
            let damageDealt = initialDamage;
            
            // if the target's AC is greater or equal than the weapon damage, reduce de damage by half
            if (target.ac >= weapon.damage) {
                damageDealt /= 2;
            }
            
            let bonus = 0;
            // Apply class-specific bonuses
            switch (attackerClass.name.toLowerCase()) {
                case 'barbarian':
                    bonus = attackerClass.attributes.strength;
                    damageDealt += bonus;
                    break;
                case 'rouge':
                    bonus = attackerClass.attributes.dexterity;
                    damageDealt += bonus;
                    break;
                default:
                    break;
        }

            target.hp -= damageDealt;
            if (target.hp < 0) target.hp = 0; // Ensure HP doesn't go negative

            const isDead = target.hp === 0;

            await pool.query('UPDATE characters SET hp = ? WHERE id = ?', [target.hp, target.id]);

            const damageMessage = bonus > 0 ? `${attacker.name} attacked ${target.name} with ${weapon.name}, dealing ${initialDamage} damage and ${bonus} bonus for a total of ${damageDealt}` : `${attacker.name} attacked ${target.name} with ${weapon.name}, dealing ${damageDealt}`;

            if (isDead) {
                damageMessage += `. ${target.name} has been defeated.`;
            }

            return {
                message: damageMessage
            }

        } catch (error) {
            console.error("Error during attack: ", error);
            throw error;
        }
    }

    static async heal(characterId) {
        try {
            const character = await CharacterService.searchCharacterById(characterId);
    
            if (!character) {
                throw new Error('Character not found');
            }
    
            const healingPotion = character.potions.find(potion => potion.effects.hpRestore > 0);
    
            if (!healingPotion) {
                throw new Error("Potion does not exist in character's inventory");
            }

            if (character.hp === character.maxHp) {
                throw new Error('Your HP is full! Keep fighting, warrior!');
            }
    
            character.hp = Math.min(character.hp + healingPotion.effects.hpRestore, character.maxHp);
    
            // Remove the used potion from the character's potions array
            character.potions = character.potions.filter(potion => potion.id !== healingPotion.id);
    
            // Update the character's HP in the database
            await pool.query('UPDATE characters SET hp = ? WHERE id = ?', [character.hp, character.id]);
    
            // Update the character's potions in the database by removing the used potion from the join table
            await pool.query('DELETE FROM character_potions WHERE character_id = ? AND potion_id = ?', [characterId, healingPotion.id]);
    
            return {
                message: `${character.name} has been healed by ${healingPotion.effects.hpRestore} HP. Current HP: ${character.hp}/${character.maxHp}`,
                character
            };
        } catch (error) {
            console.error('Error during healing:', error);
            throw error;
        }
    }
        
    
    
    
  }
  
  module.exports = CharacterService;
