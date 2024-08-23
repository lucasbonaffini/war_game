const request = require('supertest');
const express = require('express');
const router = require('../../routes/WeaponRouter');
const WeaponService = require('../../services/WeaponService');

jest.mock('../../services/WeaponService');

const app = express();
app.use(express.json());
app.use('/weapons', router);

describe('Weapon Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('POST /weapons should create a new weapon', async () => {
        const mockWeapon = { id: '1', name: 'Sword', damage: 50 };
        WeaponService.createWeapon.mockResolvedValue(mockWeapon);

        const response = await request(app)
            .post('/weapons')
            .send({ name: 'Sword', damage: 50 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockWeapon);
        expect(WeaponService.createWeapon).toHaveBeenCalledWith({ name: 'Sword', damage: 50 });
    });

    test('GET /weapons should return all weapons', async () => {
        const mockWeapons = [
            { id: '1', name: 'Sword', damage: 50 },
            { id: '2', name: 'Bow', damage: 30 },
        ];
        WeaponService.getAllWeapons.mockResolvedValue(mockWeapons);

        const response = await request(app).get('/weapons');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockWeapons);
        expect(WeaponService.getAllWeapons).toHaveBeenCalled();
    });

    test('GET /weapons/:id should return a weapon by id', async () => {
        const mockWeapon = { id: '1', name: 'Sword', damage: 50 };
        WeaponService.searchWeaponById.mockResolvedValue(mockWeapon);

        const response = await request(app).get('/weapons/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockWeapon);
        expect(WeaponService.searchWeaponById).toHaveBeenCalledWith('1');
    });

    test('GET /weapons/:id should return 404 if weapon not found', async () => {
        WeaponService.searchWeaponById.mockResolvedValue(null);

        const response = await request(app).get('/weapons/999');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Weapon not found');
        expect(WeaponService.searchWeaponById).toHaveBeenCalledWith('999');
    });

    test('PUT /weapons/:id should update a weapon', async () => {
        WeaponService.updateWeapon.mockResolvedValue(true);

        const response = await request(app)
            .put('/weapons/1')
            .send({ name: 'Updated Sword', damage: 75 });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Weapon updated successfully');
        expect(WeaponService.updateWeapon).toHaveBeenCalledWith('1', { name: 'Updated Sword', damage: 75 });
    });

    test('PUT /weapons/:id should return 404 if weapon not found', async () => {
        WeaponService.updateWeapon.mockResolvedValue(false);

        const response = await request(app)
            .put('/weapons/999')
            .send({ name: 'Updated Sword', damage: 75 });

        expect(response.status).toBe(404);
        expect(response.text).toBe('Weapon not found');
        expect(WeaponService.updateWeapon).toHaveBeenCalledWith('999', { name: 'Updated Sword', damage: 75 });
    });

    test('DELETE /weapons/:id should delete a weapon', async () => {
        WeaponService.deleteWeapon.mockResolvedValue(true);

        const response = await request(app).delete('/weapons/1');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Weapon deleted successfully');
        expect(WeaponService.deleteWeapon).toHaveBeenCalledWith('1');
    });

    test('DELETE /weapons/:id should return 404 if weapon not found', async () => {
        WeaponService.deleteWeapon.mockResolvedValue(false);

        const response = await request(app).delete('/weapons/999');

        expect(response.status).toBe(404);
        expect(response.text).toBe('Weapon not found');
        expect(WeaponService.deleteWeapon).toHaveBeenCalledWith('999');
    });
});
