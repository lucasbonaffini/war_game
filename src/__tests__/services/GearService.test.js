const GearService = require('../../services/GearService');
const Gear = require('../../models/Gear');
const pool = require('../../config/db');

jest.mock('../../models/Gear', () => {
  return jest.fn().mockImplementation((id, name, category, armour) => {
    return {
      id: id || '1',
      name,
      category,
      armour,
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('GearService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new gear', async () => {
    const mockGear = { id: '1', name: 'Plate Armor', category: 'Heavy', armour: 100 };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const gearInstance = await GearService.createGear(mockGear);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO gears (id, name, category, armour) VALUES (?, ?, ?, ?)',
      [mockGear.id, mockGear.name, mockGear.category, mockGear.armour]
    );
    expect(gearInstance).toEqual(mockGear);
  });

  test('should return all gears', async () => {
    const mockGears = [
      { id: '1', name: 'Plate Armor', category: 'Heavy', armour: 100 },
      { id: '2', name: 'Leather Armor', category: 'Light', armour: 50 },
    ];
    pool.query.mockResolvedValue([mockGears]);

    const gears = await GearService.getAllGears();

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM gears');
    expect(gears).toHaveLength(2);
    expect(gears[0].name).toBe('Plate Armor');
    expect(gears[1].name).toBe('Leather Armor');
  });

  test('should return a gear by id', async () => {
    const mockGear = { id: '1', name: 'Plate Armor', category: 'Heavy', armour: 100 };
    pool.query.mockResolvedValue([[mockGear]]);

    const gearInstance = await GearService.searchGearById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM gears WHERE id = ?', ['1']);
    expect(gearInstance).toEqual(mockGear);
  });

  test('should return null if gear not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const gearInstance = await GearService.searchGearById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM gears WHERE id = ?', ['999']);
    expect(gearInstance).toBeNull();
  });

  test('should update a gear', async () => {
    const mockGear = { id: '1', name: 'Plate Armor', category: 'Heavy', armour: 100 };
    const updatedGearData = { name: 'Enchanted Plate Armor', category: 'Heavy', armour: 150 };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedGear = await GearService.updateGear('1', updatedGearData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE gears SET name = ?, category = ?, armour = ? WHERE id = ?',
      [updatedGearData.name, updatedGearData.category, updatedGearData.armour, '1']
    );
    expect(updatedGear).toBe(true);
  });

  test('should return false if gear not found for update', async () => {
    const updatedGearData = { name: 'Enchanted Plate Armor', category: 'Heavy', armour: 150 };
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const updatedGear = await GearService.updateGear('999', updatedGearData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE gears SET name = ?, category = ?, armour = ? WHERE id = ?',
      [updatedGearData.name, updatedGearData.category, updatedGearData.armour, '999']
    );
    expect(updatedGear).toBe(false);
  });

  test('should delete a gear by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await GearService.deleteGear('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM gears WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if gear not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const result = await GearService.deleteGear('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM gears WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
  
});
