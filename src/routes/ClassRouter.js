const express = require('express');
const router = express.Router();
const ClassService = require('../services/ClassService.js');

// Create a new class
router.post('/', async (req, res) => {
    try {
        const newClass = await ClassService.createClass(req.body);
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all classes
router.get('/', async (req, res) => {
    try {
        const classes = await ClassService.getAllClasses();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a class by ID
router.get('/:id', async (req, res) => {
    try {
        const classData = await ClassService.searchClassById(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json(classData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a class
router.put('/:id', async (req, res) => {
    try {
        const updated = await ClassService.updateClass(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a class
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await ClassService.deleteClass(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
