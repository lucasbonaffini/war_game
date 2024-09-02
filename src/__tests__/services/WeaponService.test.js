const WeaponService = require('../../services/WeaponService');
const Weapon = require('../../models/Weapon');
const pool = require('../../config/db');

jest.mock('../../models/Weapon', () => {
  return jest.fn().mockImplementation((id, name, category, damage) => {
    return {
      id: id || '1',
      name,
      category,
      damage,
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('WeaponService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new weapon', async () => {
    const mockWeapon = { id: '1', name: 'Sword', category: 'Melee', damage: 50 };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const weaponInstance = await WeaponService.createWeapon(mockWeapon);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO weapons (id, name, category, damage) VALUES (?, ?, ?, ?)',
      [mockWeapon.id, mockWeapon.name, mockWeapon.category, mockWeapon.damage]
    );
    expect(weaponInstance).toEqual(mockWeapon);
  });

  test('should return all weapons', async () => {
    const mockWeapons = [
      { id: '1', name: 'Sword', category: 'Melee', damage: 50 },
      { id: '2', name: 'Bow', category: 'Ranged', damage: 30 },
    ];
    pool.query.mockResolvedValue([mockWeapons]);

    const weapons = await WeaponService.getAllWeapons();

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, category, damage FROM weapons');
    expect(weapons).toHaveLength(2);
    expect(weapons[0].name).toBe('Sword');
    expect(weapons[1].name).toBe('Bow');
  });

  test('should return a weapon by id', async () => {
    const mockWeapon = { id: '1', name: 'Sword', category: 'Melee', damage: 50 };
    pool.query.mockResolvedValue([[mockWeapon]]);

    const weaponInstance = await WeaponService.searchWeaponById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, category, damage FROM weapons WHERE id = ?', ['1']);
    expect(weaponInstance).toEqual(mockWeapon);
  });

  test('should return null if weapon not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const weaponInstance = await WeaponService.searchWeaponById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, category, damage FROM weapons WHERE id = ?', ['999']);
    expect(weaponInstance).toBeNull();
  });

  test('should update a weapon', async () => {
    const mockWeapon = { id: '1', name: 'Sword', category: 'Melee', damage: 50 };
    const updatedWeaponData = { name: 'Longsword', category: 'Melee', damage: 70 };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedWeapon = await WeaponService.updateWeapon('1', updatedWeaponData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE weapons SET name = ?, category = ?, damage = ? WHERE id = ?',
      [updatedWeaponData.name, updatedWeaponData.category, updatedWeaponData.damage, '1']
    );
    expect(updatedWeapon).toBe(true);
  });

  test('should return false if weapon not found for update', async () => {
    const updatedWeaponData = { name: 'Longsword', category: 'Melee', damage: 70 };
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const updatedWeapon = await WeaponService.updateWeapon('999', updatedWeaponData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE weapons SET name = ?, category = ?, damage = ? WHERE id = ?',
      [updatedWeaponData.name, updatedWeaponData.category, updatedWeaponData.damage, '999']
    );
    expect(updatedWeapon).toBe(false);
  });

  test('should delete a weapon by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await WeaponService.deleteWeapon('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM weapons WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if weapon not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const result = await WeaponService.deleteWeapon('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM weapons WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
});
