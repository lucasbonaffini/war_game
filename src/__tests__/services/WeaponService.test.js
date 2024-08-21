const WeaponService = require('../../services/WeaponService');
const Weapon = require('../../models/Weapon');

jest.mock('../../models/Weapon');

describe('WeaponService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create new weapon', async () => {
    const mockWeapon = { id: '1', name: 'Sword', damage: 100 };
    Weapon.create.mockResolvedValue(mockWeapon);

    const weapon = await WeaponService.addWeapon(mockWeapon);

    expect(Weapon.create).toHaveBeenCalledWith(mockWeapon);
    expect(weapon).toEqual(mockWeapon);
  });

  test('should update existing weapon', async () => {
    const mockWeapon = { name: 'Axe', damage: 120 };
    Weapon.update.mockResolvedValue([1]);

    const updated = await WeaponService.updateWeapon('1', mockWeapon);

    expect(Weapon.update).toHaveBeenCalledWith(mockWeapon, { where: { id: '1' } });
    expect(updated).toBeTruthy();
  });

  test('should delete weapon by id', async () => {
    Weapon.destroy.mockResolvedValue(1);

    const deleted = await WeaponService.deleteWeapon('1');

    expect(Weapon.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(deleted).toBeTruthy();
  });
});
