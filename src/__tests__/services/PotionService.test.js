const PotionService = require('../../services/PotionService');
const Potion = require('../../models/Potion');

jest.mock('../../models/Potion');

describe('PotionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create new potion', async () => {
    const mockPotion = { id: '1', name: 'Health Potion', effects: 'Heals 50 HP' };
    Potion.create.mockResolvedValue(mockPotion);

    const potion = await PotionService.addPotion(mockPotion);

    expect(Potion.create).toHaveBeenCalledWith(mockPotion);
    expect(potion).toEqual(mockPotion);
  });

  test('should update existing potion', async () => {
    const mockPotion = { name: 'Mana Potion', effects: 'Restores 50 MP' };
    Potion.update.mockResolvedValue([1]);

    const updated = await PotionService.updatePotion('1', mockPotion);

    expect(Potion.update).toHaveBeenCalledWith(mockPotion, { where: { id: '1' } });
    expect(updated).toBeTruthy();
  });

  test('should delete potion by id', async () => {
    Potion.destroy.mockResolvedValue(1);

    const deleted = await PotionService.deletePotion('1');

    expect(Potion.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(deleted).toBeTruthy();
  });
});
