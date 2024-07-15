const Class = require('../models/Class.js');
const pool = require('../config/db.js');

class ClassService {
    static async createClass({ name, description, attributes }) {
        try {
            const newClass = new Class(undefined, name, description, attributes);
            await pool.query(
                'INSERT INTO classes (id, name, description, attributes) VALUES (?, ?, ?, ?)',
                [newClass.id, newClass.name, newClass.description, JSON.stringify(newClass.attributes)]
            );
            return newClass;
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    }

    static async updateClass(id, { name, description, attributes }) {
        try {
            const result = await pool.query(
                'UPDATE classes SET name = ?, description = ?, attributes = ? WHERE id = ?',
                [name, description, JSON.stringify(attributes), id]
            );
            if (result.affectedRows > 0) {
                console.log('Class updated successfully');
                return true;
            }
            return false; // Return false if no rows were affected (class not found)
        } catch (error) {
            console.error('Error updating class:', error);
            throw error;
        }
    }

    static async searchClassById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM classes WHERE id = ?', [id]);
            if (rows.length > 0) {
                const classData = rows[0];
                return new Class(
                    classData.id,
                    classData.name,
                    classData.description,
                    classData.attributes || '{}'
                );
            }
            return null;
        } catch (error) {
            console.error('Error finding class by id:', error);
            throw error;
        }
    }

    static async deleteClass(id) {
        try {
            const result = await pool.query('DELETE FROM classes WHERE id = ?', [id]);
            if (result.affectedRows > 0) {
                console.log('Class deleted successfully');
                return true;
            }
            return false; // Return false if no rows were affected (class not found)
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    }

    static async getAllClasses() {
        try {
            const [rows] = await pool.query('SELECT * FROM classes');
            const classes = rows.map(classData => new Class(
                classData.id,
                classData.name,
                classData.description,
                classData.attributes || '{}'
            ));
            return classes;
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw error;
        }
    }
}

module.exports = ClassService;
