const GearService = require('../../services/GearService');
const Gear = require('../../models/Gear');

jest.mock('../../models/Gear');

describe('GearService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create new gear', async () => {
    const mockGear = { id: '1', name: 'Helmet', ac: 50 };
    Gear.create.mockResolvedValue(mockGear);

    const gear = await GearService.addGear(mockGear);

    expect(Gear.create).toHaveBeenCalledWith(mockGear);
    expect(gear).toEqual(mockGear);
  });

  test('should update existing gear', async () => {
    const mockGear = { name: 'Shield', ac: 80 };
    Gear.update.mockResolvedValue([1]);

    const updated = await GearService.updateGear('1', mockGear);

    expect(Gear.update).toHaveBeenCalledWith(mockGear, { where: { id: '1' } });
    expect(updated).toBeTruthy();
  });

  test('should delete gear by id', async () => {
    Gear.destroy.mockResolvedValue(1);

    const deleted = await GearService.deleteGear('1');

    expect(Gear.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(deleted).toBeTruthy();
  });
});
