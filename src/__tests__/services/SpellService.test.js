const SpellService = require('../../services/SpellService');
const Spell = require('../../models/Spell');

jest.mock('../../models/Spell');

describe('SpellService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new spell', async () => {
    const mockSpell = { id: '1', name: 'Fireball', description: 'A ball of fire' };
    Spell.create.mockResolvedValue(mockSpell);

    const spell = await SpellService.createSpell(mockSpell);

    expect(Spell.create).toHaveBeenCalledWith(mockSpell);
    expect(spell).toEqual(mockSpell);
  });

  test('should get a spell by id', async () => {
    const mockSpell = { id: '1', name: 'Fireball' };
    Spell.findByPk.mockResolvedValue(mockSpell);

    const spell = await SpellService.getSpellById('1');

    expect(Spell.findByPk).toHaveBeenCalledWith('1');
    expect(spell).toEqual(mockSpell);
  });

  test('should update a spell', async () => {
    const mockSpell = { name: 'Ice Shard' };
    Spell.update.mockResolvedValue([1]);

    const updated = await SpellService.updateSpell('1', mockSpell);

    expect(Spell.update).toHaveBeenCalledWith(mockSpell, { where: { id: '1' } });
    expect(updated).toBeTruthy();
  });

  test('should delete a spell', async () => {
    Spell.destroy.mockResolvedValue(1);

    const deleted = await SpellService.deleteSpell('1');

    expect(Spell.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(deleted).toBeTruthy();
  });
});
