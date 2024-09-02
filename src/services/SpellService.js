const Spell = require('../models/Spell')
const pool = require('../config/db');

class SpellService {
    static async createSpell({ name, description, manaCost, damage = 0, duration = 0 }) {
      try {
        // Create a new Spell instance using the model constructor
        const spell = new Spell(undefined, name, description, manaCost, damage, duration);
  
        const result = await pool.query(
          'INSERT INTO spells (id, name, description, manaCost, damage, duration) VALUES (?, ?, ?, ?, ?, ?)',
          [spell.id, spell.name, spell.description, spell.manaCost, spell.damage, spell.duration]
        );
            console.log('Spell created successfully:', result);
            return spell;
      } catch (error) {
            console.error('Error creating spell:', error);
            throw error;
      }
    }
    static async searchSpellById(id) {
        try {
            const [rows] = await pool.query('SELECT id, name, description, manaCost, damage, duration FROM spells WHERE id = ?', [id]);
            if(rows.length > 0) {
                const spell = rows[0];
                return new Spell(
                    spell.id,
                    spell.name,
                    spell.description,
                    spell.manaCost,
                    spell.damage,
                    spell.duration
                );
            }
            return null;
        } catch(error) {
            console.log('Error finding spell by id: ',error)
            throw error;
        }
    }
    static async updateSpell(id, { name, description, manaCost, damage, duration }) {
        try {
          const result = await pool.query(
            'UPDATE spells SET name = ?, description = ?, manaCost = ?, damage = ?, duration = ? WHERE id = ?',
            [name, description, manaCost, damage, duration, id]
          );
          if (result.affectedRows > 0) {
            console.log('Spell updated successfully');
            return true;
          }
            return false; // Return false if no rows were affected (spell not found)
        } catch (error) {
            console.error('Error updating spell:', error);
            throw error;
        }
      }
      static async deleteSpell(id) {
        try {
          const result = await pool.query('DELETE FROM spells WHERE id = ?', [id]);
          if (result.affectedRows > 0) {
            console.log('Spell deleted successfully');
            return true;
          }
            return false; // Return false if no rows were affected (spell not found)
        } catch (error) {
            console.error('Error deleting spell:', error);
            throw error;
        }
      }
      static async getAllSpells() {
        try {
          const [rows] = await pool.query('SELECT id, name, description, manaCost, damage, duration FROM spells');
          const spells = rows.map(spell => new Spell(
            spell.id,
            spell.name,
            spell.description,
            spell.manaCost,
            spell.damage,
            spell.duration
          ));
            return spells;
        } catch (error) {
            console.error('Error fetching spells:', error);
            throw error;
        }
      }
}

module.exports = SpellService;