const PotionService = require('../../services/PotionService');
const Potion = require('../../models/Potion');

jest.mock('../../models/Potion');

describe('PotionService', () => {
  test('should create a new potion', async () => {
    const mockPotion = {
      id: '1',
      name: 'Health Potion',
      effects: {
        hpRestore: 50,
        manaRestore: 0,
        increaseDamage: 0
      },
      utility: 'Heals 50 HP'
    };

    Potion.create.mockResolvedValue(mockPotion);

    const potion = await PotionService.addPotion(mockPotion);
    expect(potion).toEqual(mockPotion);
  });

  test('should update existing potion', async () => {
    const mockPotion = {
      name: 'Mana Potion',
      effects: {
        hpRestore: 0,
        manaRestore: 50,
        increaseDamage: 0
      },
      utility: 'Restores 50 MP'
    };

    Potion.update.mockResolvedValue([1]);

    const updated = await PotionService.updatePotion('1', mockPotion);
    expect(updated).toBe(1);
  });

  test('should delete potion by id', async () => {
    Potion.destroy.mockResolvedValue(1);

    const deleted = await PotionService.deletePotion('1');
    expect(deleted).toBe(1);
  });
});

