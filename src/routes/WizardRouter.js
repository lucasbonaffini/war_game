const express = require('express');
const router = express.Router();
const WizardService = require('../services/WizardService');

// Create a new wizard
router.post('/', async (req, res) => {
    try {
        const newWizard = await WizardService.createWizard(req.body);
        res.status(201).json(newWizard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all wizards
router.get('/', async (req, res) => {
    try {
        const wizards = await WizardService.getAllWizards();
        res.status(200).json(wizards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a wizard by ID
router.get('/:id', async (req, res) => {
    try {
        const wizard = await WizardService.searchWizardById(req.params.id);
        if (!wizard) {
            return res.status(404).json({ error: 'Wizard not found' });
        }
        res.status(200).json(wizard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a wizard
router.put('/:id', async (req, res) => {
    try {
        const updated = await WizardService.updateWizard(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Wizard not found' });
        }
        res.status(200).json({ message: 'Wizard updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a wizard
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await WizardService.deleteWizard(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Wizard not found' });
        }
        res.status(200).json({ message: 'Wizard deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Restore mana for a wizard
router.post('/:id/restore-mana', async (req, res) => {
    try {
        const wizard = await WizardService.restoreMana(req.params.id);
        res.status(200).json(wizard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a spell to a wizard
router.post('/:id/add-spell', async (req, res) => {
    try {
        const { spellId } = req.body;
        const wizard = await WizardService.addSpell(req.params.id, spellId);
        res.status(200).json(wizard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
