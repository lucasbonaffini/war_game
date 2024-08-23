const request = require('supertest');
const express = require('express');
const router = require('../../routes/ClassRouter');
const ClassService = require('../../services/ClassService');

jest.mock('../../services/ClassService');

const app = express();
app.use(express.json());
app.use('/classes', router);

describe('Class Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('POST /classes should create a new class', async () => {
        const mockClass = { id: '1', name: 'Warrior' };
        ClassService.createClass.mockResolvedValue(mockClass);

        const response = await request(app)
            .post('/classes')
            .send({ name: 'Warrior' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockClass);
        expect(ClassService.createClass).toHaveBeenCalledWith({ name: 'Warrior' });
    });

    test('GET /classes should return all classes', async () => {
        const mockClasses = [
            { id: '1', name: 'Warrior' },
            { id: '2', name: 'Mage' },
        ];
        ClassService.getAllClasses.mockResolvedValue(mockClasses);

        const response = await request(app).get('/classes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockClasses);
        expect(ClassService.getAllClasses).toHaveBeenCalled();
    });

    test('GET /classes/:id should return a class by id', async () => {
        const mockClass = { id: '1', name: 'Warrior' };
        ClassService.searchClassById.mockResolvedValue(mockClass);

        const response = await request(app).get('/classes/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockClass);
        expect(ClassService.searchClassById).toHaveBeenCalledWith('1');
    });

    test('GET /classes/:id should return 404 if class not found', async () => {
        ClassService.searchClassById.mockResolvedValue(null);

        const response = await request(app).get('/classes/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Class not found' });
        expect(ClassService.searchClassById).toHaveBeenCalledWith('999');
    });

    test('PUT /classes/:id should update a class', async () => {
        ClassService.updateClass.mockResolvedValue(true);

        const response = await request(app)
            .put('/classes/1')
            .send({ name: 'Updated Warrior' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Class updated successfully' });
        expect(ClassService.updateClass).toHaveBeenCalledWith('1', { name: 'Updated Warrior' });
    });

    test('PUT /classes/:id should return 404 if class not found', async () => {
        ClassService.updateClass.mockResolvedValue(false);

        const response = await request(app)
            .put('/classes/999')
            .send({ name: 'Updated Warrior' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Class not found' });
        expect(ClassService.updateClass).toHaveBeenCalledWith('999', { name: 'Updated Warrior' });
    });

    test('DELETE /classes/:id should delete a class', async () => {
        ClassService.deleteClass.mockResolvedValue(true);

        const response = await request(app).delete('/classes/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Class deleted successfully' });
        expect(ClassService.deleteClass).toHaveBeenCalledWith('1');
    });

    test('DELETE /classes/:id should return 404 if class not found', async () => {
        ClassService.deleteClass.mockResolvedValue(false);

        const response = await request(app).delete('/classes/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Class not found' });
        expect(ClassService.deleteClass).toHaveBeenCalledWith('999');
    });
});
