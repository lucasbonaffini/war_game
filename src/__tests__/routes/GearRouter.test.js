const request = require('supertest');
const express = require('express');
const gearRouter = require('../../routes/GearRouter');
const GearService = require('../../services/GearService');

const app = express();
app.use(express.json());
app.use('/gears', gearRouter);

jest.mock('../../services/GearService');

describe('Gear Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /gears should create a new gear', async () => {
    const mockGear = { id: '1', name: 'Helmet', armorClass: 50, type: 'Headgear' };
    GearService.createGear.mockResolvedValue(mockGear);

    const response = await request(app)
      .post('/gears')
      .send(mockGear);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockGear);
    expect(GearService.createGear).toHaveBeenCalledWith(mockGear);
  });

  test('GET /gears/:id should return gear by id', async () => {
    const mockGear = { id: '1', name: 'Helmet', armorClass: 50, type: 'Headgear' };
    GearService.searchGearById.mockResolvedValue(mockGear);

    const response = await request(app)
      .get('/gears/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGear);
    expect(GearService.searchGearById).toHaveBeenCalledWith('1');
  });

  test('GET /gears/:id should return 404 if gear not found', async () => {
    GearService.searchGearById.mockResolvedValue(null);

    const response = await request(app)
      .get('/gears/999')
      .send();

    expect(response.status).toBe(404);
    expect(response.text).toBe('Gear not found');
    expect(GearService.searchGearById).toHaveBeenCalledWith('999');
  });

  test('PUT /gears/:id should update gear', async () => {
    const updatedGearData = { name: 'Upgraded Helmet', armorClass: 60, type: 'Headgear' };
    GearService.updateGear.mockResolvedValue(true);

    const response = await request(app)
      .put('/gears/1')
      .send(updatedGearData);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Gear updated successfully');
    expect(GearService.updateGear).toHaveBeenCalledWith('1', updatedGearData);
  });

  test('PUT /gears/:id should return 404 if gear not found for update', async () => {
    const updatedGearData = { name: 'Upgraded Helmet', armorClass: 60, type: 'Headgear' };
    GearService.updateGear.mockResolvedValue(false);

    const response = await request(app)
      .put('/gears/999')
      .send(updatedGearData);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Gear not found');
    expect(GearService.updateGear).toHaveBeenCalledWith('999', updatedGearData);
  });

  test('DELETE /gears/:id should delete gear by id', async () => {
    GearService.deleteGear.mockResolvedValue(true);

    const response = await request(app)
      .delete('/gears/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.text).toBe('Gear deleted successfully');
    expect(GearService.deleteGear).toHaveBeenCalledWith('1');
  });

  test('DELETE /gears/:id should return 404 if gear not found for deletion', async () => {
    GearService.deleteGear.mockResolvedValue(false);

    const response = await request(app)
      .delete('/gears/999')
      .send();

    expect(response.status).toBe(404);
    expect(response.text).toBe('Gear not found');
    expect(GearService.deleteGear).toHaveBeenCalledWith('999');
  });

  test('GET /gears should return all gears', async () => {
    const mockGears = [
      { id: '1', name: 'Helmet', armorClass: 50, type: 'Headgear' },
      { id: '2', name: 'Shield', armorClass: 70, type: 'Offhand' },
    ];
    GearService.getAllGears.mockResolvedValue(mockGears);

    const response = await request(app)
      .get('/gears')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGears);
    expect(GearService.getAllGears).toHaveBeenCalled();
  });
});
