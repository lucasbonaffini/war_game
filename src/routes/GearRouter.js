const express = require('express');
const router = express.Router();
const GearService = require('../services/GearService.js')


router.post('/', async (req, res, next) => {
    try {
        const gear = await GearService.createGear(req.body);
        res.status(201).json(gear);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const gear = await GearService.searchGearById(req.params.id);
        if (potion) {
            res.status(200).json(gear);
        } else {
            res.status(404).send('Gear not found')
        }
    } catch (error) {
        console.error('Error finding gear:', error);
        next(error);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const updated = await GearService.updateGear(req.params.id, req.body);
        if (updated) {
            res.status(200).send('Gear updated successfully')
        } else {
            res.status(404).send('Gear not found')
        }
    } catch (error) {
        next(error);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await GearService.deleteGear(req.params.id)
    if (deleted) {
        res.status(200).send('Gear deleted successfully');
    } else {
        res.status(404).send('Gear not found')
    }
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const gears = await GearService.getAllGears();
        res.status(200).json(gears);
    } catch (error) {
        next(error);
    }
})



module.exports = router;