const Weapon = require('../models/Weapon')
const pool = require('../config/db');

class WeaponService {
    static async createWeapon({ name, category, damage }) {
      try {
        // Create a new Weapon instance using the model constructor
        const weapon = new Weapon(undefined, name, category, damage);
  
        const result = await pool.query(
          'INSERT INTO weapons (id, name, category, damage) VALUES (?, ?, ?, ?)',
          [weapon.id, weapon.name, weapon.category, weapon.damage]
        );
            console.log('Weapon created successfully:', result);
            return weapon;
      } catch (error) {
            console.error('Error creating weapon:', error);
            throw error;
      }
    }
    static async searchWeaponById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM weapons WHERE id = ?', [id]);
            if(rows.length > 0) {
                const weapon = rows[0];
                return new Weapon(
                    weapon.id,
                    weapon.name,
                    weapon.category,
                    weapon.damage
                );
            }
            return null;
        } catch(error) {
            console.log('Error finding weapon by id: ',error)
            throw error;
        }
    }
    static async updateWeapon(id, { name, category, damage }) {
        try {
          const result = await pool.query(
            'UPDATE weapons SET name = ?, category = ?, damage = ? WHERE id = ?',
            [name, category, damage, id]
          );
          if (result.affectedRows > 0) {
            console.log('Weapon updated successfully');
            return true;
          }
            return false; // Return false if no rows were affected (weapon not found)
        } catch (error) {
            console.error('Error updating weapon:', error);
            throw error;
        }
      }
      static async deleteWeapon(id) {
        try {
          const result = await pool.query('DELETE FROM weapons WHERE id = ?', [id]);
          if (result.affectedRows > 0) {
            console.log('Weapon deleted successfully');
            return true;
          }
            return false; // Return false if no rows were affected (weapon not found)
        } catch (error) {
            console.error('Error deleting weapon:', error);
            throw error;
        }
      }
      static async getAllWeapons() {
        try {
          const [rows] = await pool.query('SELECT * FROM weapons');
          const weapons = rows.map(weapon => new Weapon(
            weapon.id,
            weapon.name,
            weapon.category,
            weapon.damage
          ));
            return weapons;
        } catch (error) {
            console.error('Error fetching weapons:', error);
            throw error;
        }
      }
}

module.exports = WeaponService;