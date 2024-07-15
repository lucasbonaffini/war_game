const express = require('express');
const router = express.Router();
const PotionService = require('../services/PotionService.js')


router.post('/', async (req, res, next) => {
    try {
        const potion = await PotionService.createPotion(req.body);
        res.status(201).json(potion);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const potion = await PotionService.searchPotionById(req.params.id);
        if (potion) {
            res.status(200).json(potion);
        } else {
            res.status(404).send('Potion not found')
        }
    } catch (error) {
        console.error('Error finding potion:', error);
        next(error);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const updated = await PotionService.updatePotion(req.params.id, req.body);
        if (updated) {
            res.status(200).send('Potion updated successfully')
        } else {
            res.status(404).send('Potion not found')
        }
    } catch (error) {
        next(error);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await PotionService.deletePotion(req.params.id)
    if (deleted) {
        res.status(200).send('Potion deleted successfully');
    } else {
        res.status(404).send('Potion not found')
    }
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const potions = await PotionService.getAllPotions();
        res.status(200).json(potions);
    } catch (error) {
        next(error);
    }
})



module.exports = router;