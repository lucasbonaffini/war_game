const request = require('supertest');
const express = require('express');
const router = require('../../routes/PotionRouter');
const PotionService = require('../../services/PotionService');

jest.mock('../../services/PotionService');

const app = express();
app.use(express.json());
app.use('/potions', router);

describe('Potion Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('POST /potions should create a new potion', async () => {
        const mockPotion = { id: '1', name: 'Health Potion', effects: { hpRestore: 50 }, utility: 'Healing' };
        PotionService.createPotion.mockResolvedValue(mockPotion);

        const response = await request(app)
            .post('/potions')
            .send({ name: 'Health Potion', effects: { hpRestore: 50 }, utility: 'Healing' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockPotion);
        expect(PotionService.createPotion).toHaveBeenCalledWith({ name: 'Health Potion', effects: { hpRestore: 50 }, utility: 'Healing' });
    });

    test('GET /potions should return all potions', async () => {
        const mockPotions = [
            { id: '1', name: 'Health Potion', effects: { hpRestore: 50 }, utility: 'Healing' },
            { id: '2', name: 'Mana Potion', effects: { manaRestore: 30 }, utility: 'Mana Recovery' },
        ];
        PotionService.getAllPotions.mockResolvedValue(mockPotions);

        const response = await request(app).get('/potions');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPotions);
        expect(PotionService.getAllPotions).toHaveBeenCalled();
    });

    test('GET /potions/:id should return a potion by id', async () => {
        const mockPotion = { id: '1', name: 'Health Potion', effects: { hpRestore: 50 }, utility: 'Healing' };
        PotionService.searchPotionById.mockResolvedValue(mockPotion);

        const response = await request(app).get('/potions/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPotion);
        expect(PotionService.searchPotionById).toHaveBeenCalledWith('1');
    });

    test('GET /potions/:id should return 404 if potion not found', async () => {
        PotionService.searchPotionById.mockResolvedValue(null);

        const response = await request(app).get('/potions/999');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Potion not found');
        expect(PotionService.searchPotionById).toHaveBeenCalledWith('999');
    });

    test('PUT /potions/:id should update a potion', async () => {
        PotionService.updatePotion.mockResolvedValue(true);

        const response = await request(app)
            .put('/potions/1')
            .send({ name: 'Updated Health Potion', effects: { hpRestore: 75 }, utility: 'Healing' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Potion updated successfully');
        expect(PotionService.updatePotion).toHaveBeenCalledWith('1', { name: 'Updated Health Potion', effects: { hpRestore: 75 }, utility: 'Healing' });
    });

    test('PUT /potions/:id should return 404 if potion not found', async () => {
        PotionService.updatePotion.mockResolvedValue(false);

        const response = await request(app)
            .put('/potions/999')
            .send({ name: 'Updated Health Potion', effects: { hpRestore: 75 }, utility: 'Healing' });

        expect(response.status).toBe(404);
        expect(response.text).toBe('Potion not found');
        expect(PotionService.updatePotion).toHaveBeenCalledWith('999', { name: 'Updated Health Potion', effects: { hpRestore: 75 }, utility: 'Healing' });
    });

    test('DELETE /potions/:id should delete a potion', async () => {
        PotionService.deletePotion.mockResolvedValue(true);

        const response = await request(app).delete('/potions/1');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Potion deleted successfully');
        expect(PotionService.deletePotion).toHaveBeenCalledWith('1');
    });

    test('DELETE /potions/:id should return 404 if potion not found', async () => {
        PotionService.deletePotion.mockResolvedValue(false);

        const response = await request(app).delete('/potions/999');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Potion not found');
        expect(PotionService.deletePotion).toHaveBeenCalledWith('999');
    });
});
