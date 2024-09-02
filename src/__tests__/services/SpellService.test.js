const SpellService = require('../../services/SpellService');
const Spell = require('../../models/Spell');
const pool = require('../../config/db');

jest.mock('../../models/Spell', () => {
  return jest.fn().mockImplementation((id, name, description, manaCost, damage, duration) => {
    return {
      id: id || '1',
      name,
      description,
      manaCost,
      damage,
      duration,
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('SpellService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new spell', async () => {
    const mockSpell = { id: '1', name: 'Fireball', description: 'A powerful fireball', manaCost: 50, damage: 100, duration: 5 };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const spellInstance = await SpellService.createSpell(mockSpell);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO spells (id, name, description, manaCost, damage, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [mockSpell.id, mockSpell.name, mockSpell.description, mockSpell.manaCost, mockSpell.damage, mockSpell.duration]
    );
    expect(spellInstance).toEqual(mockSpell);
  });

  test('should return all spells', async () => {
    const mockSpells = [
      { id: '1', name: 'Fireball', description: 'A powerful fireball', manaCost: 50, damage: 100, duration: 5 },
      { id: '2', name: 'Ice Blast', description: 'A chilling blast of ice', manaCost: 60, damage: 80, duration: 7 },
    ];
    pool.query.mockResolvedValue([mockSpells]);

    const spells = await SpellService.getAllSpells();

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, manaCost, damage, duration FROM spells');
    expect(spells).toHaveLength(2);
    expect(spells[0].name).toBe('Fireball');
    expect(spells[1].name).toBe('Ice Blast');
  });

  test('should return a spell by id', async () => {
    const mockSpell = { id: '1', name: 'Fireball', description: 'A powerful fireball', manaCost: 50, damage: 100, duration: 5 };
    pool.query.mockResolvedValue([[mockSpell]]);

    const spellInstance = await SpellService.searchSpellById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, manaCost, damage, duration FROM spells WHERE id = ?', ['1']);
    expect(spellInstance).toEqual(mockSpell);
  });

  test('should return null if spell not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const spellInstance = await SpellService.searchSpellById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, manaCost, damage, duration FROM spells WHERE id = ?', ['999']);
    expect(spellInstance).toBeNull();
  });

  test('should update a spell', async () => {
    const mockSpell = { id: '1', name: 'Fireball', description: 'A powerful fireball', manaCost: 50, damage: 100, duration: 5 };
    const updatedSpellData = { name: 'Greater Fireball', description: 'A more powerful fireball', manaCost: 60, damage: 150, duration: 6 };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedSpell = await SpellService.updateSpell('1', updatedSpellData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE spells SET name = ?, description = ?, manaCost = ?, damage = ?, duration = ? WHERE id = ?',
      [updatedSpellData.name, updatedSpellData.description, updatedSpellData.manaCost, updatedSpellData.damage, updatedSpellData.duration, '1']
    );
    expect(updatedSpell).toBe(true);
  });

  test('should return false if spell not found for update', async () => {
    const updatedSpellData = { name: 'Greater Fireball', description: 'A more powerful fireball', manaCost: 60, damage: 150, duration: 6 };
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const updatedSpell = await SpellService.updateSpell('999', updatedSpellData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE spells SET name = ?, description = ?, manaCost = ?, damage = ?, duration = ? WHERE id = ?',
      [updatedSpellData.name, updatedSpellData.description, updatedSpellData.manaCost, updatedSpellData.damage, updatedSpellData.duration, '999']
    );
    expect(updatedSpell).toBe(false);
  });

  test('should delete a spell by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await SpellService.deleteSpell('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM spells WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if spell not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const result = await SpellService.deleteSpell('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM spells WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
  test('should handle errors during spell creation', async () => {
    const mockSpell = { id: '1', name: 'Fireball', description: 'A powerful fireball', manaCost: 50, damage: 100, duration: 5 };
    pool.query.mockRejectedValue(new Error('Database error'));
  
    await expect(SpellService.createSpell(mockSpell)).rejects.toThrow('Database error');
  });
  
  test('should handle errors during spell update', async () => {
    const updatedSpellData = { name: 'Greater Fireball', description: 'A more powerful fireball', manaCost: 60, damage: 150, duration: 6 };
    pool.query.mockRejectedValue(new Error('Database error'));
  
    await expect(SpellService.updateSpell('1', updatedSpellData)).rejects.toThrow('Database error');
  });
  
  test('should handle errors during spell deletion', async () => {
    pool.query.mockRejectedValue(new Error('Database error'));
  
    await expect(SpellService.deleteSpell('1')).rejects.toThrow('Database error');
  });

  test('should handle errors when deleting a non-existing spell', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });
  
    await expect(SpellService.deleteSpell('non-existing-id')).resolves.toBe(false);
  });
  
  test('should handle errors when creating a spell with missing fields', async () => {
    const invalidSpell = { id: '', name: '', description: '', manaCost: -1, damage: -10, duration: -1 };
    pool.query.mockRejectedValue(new Error('Validation error'));
  
    await expect(SpellService.createSpell(invalidSpell)).rejects.toThrow('Validation error');
  });
  
  test('should handle errors when deleting a non-existing spell', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });
  
    await expect(SpellService.deleteSpell('non-existing-id')).resolves.toBe(false);
  });
  
  test('should handle database errors when getting all spells', async () => {
    pool.query.mockRejectedValue(new Error('Database error'));
  
    await expect(SpellService.getAllSpells()).rejects.toThrow('Database error');
  });
  
});