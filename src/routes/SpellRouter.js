const express = require('express');
const router = express.Router();
const SpellService = require('../services/SpellService.js')


router.post('/', async (req, res, next) => {
    try {
        const spell = await SpellService.createSpell(req.body);
        res.status(201).json(spell);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const spell = await SpellService.searchSpellById(req.params.id);
        if (spell) {
            res.status(200).json(spell);
        } else {
            res.status(404).send('Spell not found')
        }
    } catch (error) {
        console.error('Error finding spell:', error);
        next(error);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const updated = await SpellService.updateSpell(req.params.id, req.body);
        if (updated) {
            res.status(200).send('Spell updated successfully')
        } else {
            res.status(404).send('Spell not found')
        }
    } catch (error) {
        next(error);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await SpellService.deleteSpell(req.params.id)
    if (deleted) {
        res.status(200).send('Spell deleted successfully');
    } else {
        res.status(404).send('Spell not found')
    }
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const spells = await SpellService.getAllSpells();
        res.status(200).json(spells);
    } catch (error) {
        next(error);
    }
})



module.exports = router;