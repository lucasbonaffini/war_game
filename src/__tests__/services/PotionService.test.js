const PotionService = require('../../services/PotionService');
const Potion = require('../../models/Potion');
const pool = require('../../config/db');

jest.mock('../../models/Potion', () => {
  return jest.fn().mockImplementation((id, name, effects, utility) => {
    return {
      id: id || '1',
      name,
      effects,
      utility,
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('PotionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new potion', async () => {
    const mockPotion = { id: '1', name: 'Healing Potion', effects: { hpRestore: 50 }, utility: 'restore health' };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const potionInstance = await PotionService.createPotion(mockPotion);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO potions (id, name, effects, utility) VALUES (?, ?, ?, ?)',
      [mockPotion.id, mockPotion.name, JSON.stringify(mockPotion.effects), mockPotion.utility]
    );
    expect(potionInstance).toEqual(mockPotion);
  });

  test('should return all potions', async () => {
    const mockPotions = [
      { id: '1', name: 'Healing Potion', effects: '{"hpRestore":50}', utility: 'restore health' },
      { id: '2', name: 'Mana Potion', effects: '{"manaRestore":30}', utility: 'restore mana' },
    ];
    pool.query.mockResolvedValue([mockPotions]);

    const potions = await PotionService.getAllPotions();

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM potions');
    expect(potions).toHaveLength(2);
    expect(potions[0].name).toBe('Healing Potion');
    expect(potions[1].name).toBe('Mana Potion');
  });

  test('should return a potion by id', async () => {
    const mockPotion = { id: '1', name: 'Healing Potion', effects: '{"hpRestore":50}', utility: 'restore health' };
    pool.query.mockResolvedValue([[mockPotion]]);

    const potionInstance = await PotionService.searchPotionById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM potions WHERE id = ?', ['1']);
    expect(potionInstance).toEqual(mockPotion);
  });

  test('should return null if potion not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const potionInstance = await PotionService.searchPotionById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM potions WHERE id = ?', ['999']);
    expect(potionInstance).toBeNull();
  });

  test('should update a potion', async () => {
    const mockPotion = { id: '1', name: 'Healing Potion', effects: '{"hpRestore":50}', utility: 'restore health' };
    const updatedPotionData = { name: 'Greater Healing Potion', effects: { hpRestore: 100 }, utility: 'restore more health' };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedPotion = await PotionService.updatePotion('1', updatedPotionData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE potions SET name = ?, effects = ?, utility = ? WHERE id = ?',
      [updatedPotionData.name, JSON.stringify(updatedPotionData.effects), updatedPotionData.utility, '1']
    );
    expect(updatedPotion).toBe(true);
  });

  test('should return false if potion not found for update', async () => {
    const updatedPotionData = { name: 'Greater Healing Potion', effects: { hpRestore: 100 }, utility: 'restore more health' };
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const updatedPotion = await PotionService.updatePotion('999', updatedPotionData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE potions SET name = ?, effects = ?, utility = ? WHERE id = ?',
      [updatedPotionData.name, JSON.stringify(updatedPotionData.effects), updatedPotionData.utility, '999']
    );
    expect(updatedPotion).toBe(false);
  });

  test('should delete a potion by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await PotionService.deletePotion('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM potions WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if potion not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const result = await PotionService.deletePotion('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM potions WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
});
