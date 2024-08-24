const request = require('supertest');
const express = require('express');
const SpellService = require('../../services/SpellService.js');
const spellRouter = require('../../routes/SpellRouter.js');

const app = express();
app.use(express.json());
app.use('/spells', spellRouter);

jest.mock('../../services/SpellService.js');

describe('Spell Router', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /spells', () => {
        it('should create a new spell', async () => {
            const mockSpell = { id: '1', name: 'Fireball', damage: 100 };
            SpellService.createSpell.mockResolvedValue(mockSpell);

            const response = await request(app)
                .post('/spells')
                .send({ name: 'Fireball', damage: 100 });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockSpell);
            expect(SpellService.createSpell).toHaveBeenCalledWith({ name: 'Fireball', damage: 100 });
        });

        it('should return 500 if there is an error', async () => {
            SpellService.createSpell.mockRejectedValue(new Error('Internal Server Error'));

            const response = await request(app)
                .post('/spells')
                .send({ name: 'Fireball', damage: 100 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('GET /spells/:id', () => {
        it('should return spell by id', async () => {
            const mockSpell = { id: '1', name: 'Fireball', damage: 100 };
            SpellService.searchSpellById.mockResolvedValue(mockSpell);

            const response = await request(app).get('/spells/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSpell);
            expect(SpellService.searchSpellById).toHaveBeenCalledWith('1');
        });

        it('should return 404 if spell not found', async () => {
            SpellService.searchSpellById.mockResolvedValue(null);

            const response = await request(app).get('/spells/999');

            expect(response.status).toBe(404);
            expect(response.text).toBe('Spell not found');
            expect(SpellService.searchSpellById).toHaveBeenCalledWith('999');
        });

        it('should return 500 if there is an error', async () => {
            SpellService.searchSpellById.mockRejectedValue(new Error('Internal Server Error'));

            const response = await request(app).get('/spells/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('PUT /spells/:id', () => {
        it('should update a spell', async () => {
            SpellService.updateSpell.mockResolvedValue(true);

            const response = await request(app)
                .put('/spells/1')
                .send({ name: 'Fireball', damage: 120 });

            expect(response.status).toBe(200);
            expect(response.text).toBe('Spell updated successfully');
            expect(SpellService.updateSpell).toHaveBeenCalledWith('1', { name: 'Fireball', damage: 120 });
        });

        it('should return 404 if spell not found', async () => {
            SpellService.updateSpell.mockResolvedValue(false);

            const response = await request(app)
                .put('/spells/999')
                .send({ name: 'Fireball', damage: 120 });

            expect(response.status).toBe(404);
            expect(response.text).toBe('Spell not found');
            expect(SpellService.updateSpell).toHaveBeenCalledWith('999', { name: 'Fireball', damage: 120 });
        });

        it('should return 500 if there is an error', async () => {
            SpellService.updateSpell.mockRejectedValue(new Error('Internal Server Error'));

            const response = await request(app)
                .put('/spells/1')
                .send({ name: 'Fireball', damage: 120 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('DELETE /spells/:id', () => {
        it('should delete a spell', async () => {
            SpellService.deleteSpell.mockResolvedValue(true);

            const response = await request(app).delete('/spells/1');

            expect(response.status).toBe(200);
            expect(response.text).toBe('Spell deleted successfully');
            expect(SpellService.deleteSpell).toHaveBeenCalledWith('1');
        });

        it('should return 404 if spell not found', async () => {
            SpellService.deleteSpell.mockResolvedValue(false);

            const response = await request(app).delete('/spells/999');

            expect(response.status).toBe(404);
            expect(response.text).toBe('Spell not found');
            expect(SpellService.deleteSpell).toHaveBeenCalledWith('999');
        });

        it('should return 500 if there is an error', async () => {
            SpellService.deleteSpell.mockRejectedValue(new Error('Internal Server Error'));

            const response = await request(app).delete('/spells/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal Server Error' });
        });
    });

    describe('GET /spells', () => {
        it('should return all spells', async () => {
            const mockSpells = [
                { id: '1', name: 'Fireball', damage: 100 },
                { id: '2', name: 'Ice Spike', damage: 80 },
            ];
            SpellService.getAllSpells.mockResolvedValue(mockSpells);

            const response = await request(app).get('/spells');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSpells);
            expect(SpellService.getAllSpells).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            SpellService.getAllSpells.mockRejectedValue(new Error('Internal Server Error'));

            const response = await request(app).get('/spells');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Internal Server Error' });
        });
    });
});

