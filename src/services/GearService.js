const Gear = require('../models/Gear')
const pool = require('../config/db');

class GearService {
    static async createGear({ name, category, armour }) {
      try {
        // Create a new Gear instance using the model constructor
        const gear = new Gear(undefined, name, category, armour);
  
        const result = await pool.query(
          'INSERT INTO gears (id, name, category, armour) VALUES (?, ?, ?, ?)',
          [gear.id, gear.name, gear.category, gear.armour]
        );
            console.log('Gear created successfully:', result);
            return gear;
      } catch (error) {
            console.error('Error creating gear:', error);
            throw error;
      }
    }
    static async searchGearById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM gears WHERE id = ?', [id]);
            if(rows.length > 0) {
                const gear = rows[0];
                return new Gear(
                    gear.id,
                    gear.name,
                    gear.category,
                    gear.armour
                );
            }
            return null;
        } catch(error) {
            console.log('Error finding gear by id: ',error)
            throw error;
        }
    }
    static async updateGear(id, { name, category, armour }) {
        try {
          const result = await pool.query(
            'UPDATE gears SET name = ?, category = ?, armour = ? WHERE id = ?',
            [name, category, armour, id]
          );
          if (result.affectedRows > 0) {
            console.log('Gear updated successfully');
            return true;
          }
            return false; // Return false if no rows were affected (gear not found)
        } catch (error) {
            console.error('Error updating gear:', error);
            throw error;
        }
      }
      static async deleteGear(id) {
        try {
          const result = await pool.query('DELETE FROM gears WHERE id = ?', [id]);
          if (result.affectedRows > 0) {
            console.log('Gear deleted successfully');
            return true;
          }
            return false; // Return false if no rows were affected (gear not found)
        } catch (error) {
            console.error('Error deleting gear:', error);
            throw error;
        }
      }
      static async getAllGears() {
        try {
          const [rows] = await pool.query('SELECT * FROM gears');
          const gears = rows.map(gear => new Gear(
            gear.id,
            gear.name,
            gear.category,
            gear.armour
          ));
            return gears;
        } catch (error) {
            console.error('Error fetching gears:', error);
            throw error;
        }
      }
}

module.exports = GearService;