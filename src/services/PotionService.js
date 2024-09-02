const Potion = require('../models/Potion')
const pool = require('../config/db');

class PotionService {
    static async createPotion({ name, effects, utility }) {
      try {
        // Create a new Potion instance using the model constructor
        const potion = new Potion(undefined, name, effects, utility);
  
        const result = await pool.query(
          'INSERT INTO potions (id, name, effects, utility) VALUES (?, ?, ?, ?)',
          [potion.id, potion.name, JSON.stringify(potion.effects), potion.utility]
        );
            console.log('Potion created successfully:', result);
            return potion;
      } catch (error) {
            console.error('Error creating potion:', error);
            throw error;
      }
    }
    static async searchPotionById(id) {
        try {
            const [rows] = await pool.query('SELECT id, name, effects, utility FROM potions WHERE id = ?', [id]);
            if(rows.length > 0) {
                const potion = rows[0];
                return new Potion(
                    potion.id,
                    potion.name,
                    potion.effects,
                    potion.utility
                );
            }
            return null;
        } catch(error) {
            console.log('Error finding potion by id: ',error)
            throw error;
        }
    }
    static async updatePotion(id, { name, effects, utility }) {
        try {
          const result = await pool.query(
            'UPDATE potions SET name = ?, effects = ?, utility = ? WHERE id = ?',
            [name, JSON.stringify(effects), utility, id]
          );
          if (result.affectedRows > 0) {
            console.log('Potion updated successfully');
            return true;
          }
            return false; // Return false if no rows were affected (potion not found)
        } catch (error) {
            console.error('Error updating potion:', error);
            throw error;
        }
      }
      static async deletePotion(id) {
        try {
          const result = await pool.query('DELETE FROM potions WHERE id = ?', [id]);
          if (result.affectedRows > 0) {
            console.log('Potion deleted successfully');
            return true;
          }
            return false; // Return false if no rows were affected (potion not found)
        } catch (error) {
            console.error('Error deleting potion:', error);
            throw error;
        }
      }
      static async getAllPotions() {
        try {
          const [rows] = await pool.query('SELECT id, name, effects, utility FROM potions');
          const potions = rows.map(potion => new Potion(
            potion.id,
            potion.name,
            potion.effects,
            potion.utility
          ));
            return potions;
        } catch (error) {
            console.error('Error fetching potions:', error);
            throw error;
        }
      }
}

module.exports = PotionService;