const express = require('express');
const router = express.Router();
const WeaponService = require('../services/WeaponService.js')


router.post('/', async (req, res, next) => {
    try {
        const weapon = await WeaponService.createWeapon(req.body);
        res.status(201).json(weapon);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const weapon = await WeaponService.searchWeaponById(req.params.id);
        if (weapon) {
            res.status(200).json(weapon);
        } else {
            res.status(404).send('Weapon not found')
        }
    } catch (error) {
        console.error('Error finding weapon:', error);
        next(error);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const updated = await WeaponService.updateWeapon(req.params.id, req.body);
        if (updated) {
            res.status(200).send('Weapon updated successfully')
        } else {
            res.status(404).send('Weapon not found')
        }
    } catch (error) {
        next(error);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await WeaponService.deleteWeapon(req.params.id)
    if (deleted) {
        res.status(200).send('Weapon deleted successfully');
    } else {
        res.status(404).send('Weapon not found')
    }
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const weapons = await WeaponService.getAllWeapons();
        res.status(200).json(weapons);
    } catch (error) {
        next(error);
    }
})



module.exports = router;