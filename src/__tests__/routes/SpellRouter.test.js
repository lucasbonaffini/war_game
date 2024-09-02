const request = require('supertest');
const express = require('express');
const router = require('../../routes/SpellRouter');
const SpellService = require('../../services/SpellService');

jest.mock('../../services/SpellService');

const app = express();
app.use(express.json());
app.use('/spells', router);

describe('Spell Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('POST /spells should create a new spell', async () => {
        const mockSpell = { id: '1', name: 'Fireball', damage: 100, manaCost: 50, description: 'A powerful fire spell' };
        SpellService.createSpell.mockResolvedValue(mockSpell);

        const response = await request(app)
            .post('/spells')
            .send({ name: 'Fireball', damage: 100, manaCost: 50, description: 'A powerful fire spell' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockSpell);
        expect(SpellService.createSpell).toHaveBeenCalledWith({ name: 'Fireball', damage: 100, manaCost: 50, description: 'A powerful fire spell' });
    });

    test('GET /spells should return all spells', async () => {
        const mockSpells = [
            { id: '1', name: 'Fireball', damage: 100, manaCost: 50, description: 'A powerful fire spell' },
            { id: '2', name: 'Ice Shard', damage: 80, manaCost: 40, description: 'A chilling ice spell' },
        ];
        SpellService.getAllSpells.mockResolvedValue(mockSpells);

        const response = await request(app).get('/spells');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockSpells);
        expect(SpellService.getAllSpells).toHaveBeenCalled();
    });

    test('GET /spells/:id should return a spell by id', async () => {
        const mockSpell = { id: '1', name: 'Fireball', damage: 100, manaCost: 50, description: 'A powerful fire spell' };
        SpellService.searchSpellById.mockResolvedValue(mockSpell);

        const response = await request(app).get('/spells/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockSpell);
        expect(SpellService.searchSpellById).toHaveBeenCalledWith('1');
    });

    test('GET /spells/:id should return 404 if spell not found', async () => {
        SpellService.searchSpellById.mockResolvedValue(null);

        const response = await request(app).get('/spells/999');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Spell not found');
        expect(SpellService.searchSpellById).toHaveBeenCalledWith('999');
    });

    test('PUT /spells/:id should update a spell', async () => {
        SpellService.updateSpell.mockResolvedValue(true);

        const response = await request(app)
            .put('/spells/1')
            .send({ name: 'Updated Fireball', damage: 120, manaCost: 60, description: 'An even more powerful fire spell' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Spell updated successfully');
        expect(SpellService.updateSpell).toHaveBeenCalledWith('1', { name: 'Updated Fireball', damage: 120, manaCost: 60, description: 'An even more powerful fire spell' });
    });

    test('PUT /spells/:id should return 404 if spell not found', async () => {
        SpellService.updateSpell.mockResolvedValue(false);

        const response = await request(app)
            .put('/spells/999')
            .send({ name: 'Updated Fireball', damage: 120, manaCost: 60, description: 'An even more powerful fire spell' });

        expect(response.status).toBe(404);
        expect(response.text).toBe('Spell not found');
        expect(SpellService.updateSpell).toHaveBeenCalledWith('999', { name: 'Updated Fireball', damage: 120, manaCost: 60, description: 'An even more powerful fire spell' });
    });

    test('DELETE /spells/:id should delete a spell', async () => {
        SpellService.deleteSpell.mockResolvedValue(true);

        const response = await request(app).delete('/spells/1');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Spell deleted successfully');
        expect(SpellService.deleteSpell).toHaveBeenCalledWith('1');
    });

    test('DELETE /spells/:id should return 404 if spell not found', async () => {
        SpellService.deleteSpell.mockResolvedValue(false);

        const response = await request(app).delete('/spells/999');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Spell not found');
        expect(SpellService.deleteSpell).toHaveBeenCalledWith('999');
    });
});