const express = require('express');
const router = express.Router();
const CharacterService = require('../services/CharacterService.js')


router.post('/', async (req, res, next) => {
    try {
        const character = await CharacterService.createCharacter(req.body);
        res.status(201).json(character);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const character = await CharacterService.searchCharacterById(req.params.id);
        if (character) {
            res.status(200).json(character);
        } else {
            res.status(404).send('Character not found')
        }
    } catch (error) {
        console.error('Error finding character:', error);
        next(error);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const updated = await CharacterService.updateCharacter(req.params.id, req.body);
        if (updated) {
            res.status(200).send('Character updated successfully')
        } else {
            res.status(404).send('Character not found')
        }
    } catch (error) {
        next(error);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await CharacterService.deleteCharacter(req.params.id)
    if (deleted) {
        res.status(200).send('Character deleted successfully');
    } else {
        res.status(404).send('Character not found')
    }
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const characters = await CharacterService.getAllCharacters();
        res.status(200).json(characters);
    } catch (error) {
        next(error);
    }
})

router.post('/attack', async (req, res, next) => {
    const { attackerId, targetId, weaponId } = req.body;
    try {
        const result = await CharacterService.attack(attackerId, targetId, weaponId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/potion/:characterId/:potionId', async (req, res, next) => {
    try {
        const character = await CharacterService.addPotion(req.params.characterId, req.params.potionId);
        res.status(200).json(character);
    } catch (error) {
        next(error);
    }
});

router.post('/heal/:characterId', async (req, res, next) => {
    try {
        const character = await CharacterService.heal(req.params.characterId);
        res.status(200).json(character);
    } catch (error) {
        next(error);
    }
});

module.exports = router;