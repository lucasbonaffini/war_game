const Potion = require('../models/Potion')
const pool = require('../config/db');

class PotionService {
    static async createPotion({ name, effects, usage }) {
      try {
        // Create a new Potion instance using the model constructor
        const potion = new Potion(undefined, name, effects, usage);
  
        const result = await pool.query(
          'INSERT INTO potions (id, name, effects, usage) VALUES (?, ?, ?, ?)',
          [potion.id, potion.name, potion.effects, potion.usage]
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
            const [rows] = await pool.query('SELECT * FROM potions WHERE id = ?', [id]);
            if(rows.length > 0) {
                const potion = rows[0];
                return new Potion(
                    potion.id,
                    potion.name,
                    potion.effects,
                    potion.usage
                );
            }
            return null;
        } catch(error) {
            console.log('Error finding potion by id: ',error)
            throw error;
        }
    }
    static async updatePotion(id, { name, effects, usage }) {
        try {
          const result = await pool.query(
            'UPDATE potions SET name = ?, effects = ?, usage = ? WHERE id = ?',
            [name, effects, usage, id]
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
          const [rows] = await pool.query('SELECT * FROM potions');
          const potions = rows.map(potion => new Potion(
            potion.id,
            potion.name,
            potion.effects,
            potion.usage
          ));
            return potions;
        } catch (error) {
            console.error('Error fetching potions:', error);
            throw error;
        }
      }
}

module.exports = PotionService;