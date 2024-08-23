const SpellService = require('../services/SpellService');
const pool = require('../config/db');
const Spell = require('../models/Spell');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

describe('SpellService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSpell', () => {
    it('should create a spell and return the spell object', async () => {
      const spellData = {
        name: 'Fireball',
        description: 'A ball of fire that causes damage',
        manaCost: 50,
        damage: 100,
        duration: 5
      };

      const mockResult = { affectedRows: 1, insertId: 'uuid-mock-id' };
      pool.query.mockResolvedValue([mockResult]);

      const spell = await SpellService.createSpell(spellData);

      expect(spell).toBeInstanceOf(Spell);
      expect(spell.name).toBe(spellData.name);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO spells (id, name, description, manaCost, damage, duration) VALUES (?, ?, ?, ?, ?, ?)',
        [spell.id, spell.name, spell.description, spell.manaCost, spell.damage, spell.duration]
      );
    });

    it('should throw an error if spell creation fails', async () => {
      const spellData = {
        name: 'Ice Blast',
        description: 'A chilling blast of ice',
        manaCost: 60,
        damage: 80,
        duration: 7
      };

      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(SpellService.createSpell(spellData)).rejects.toThrow('Database error');
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO spells (id, name, description, manaCost, damage, duration) VALUES (?, ?, ?, ?, ?, ?)',
        expect.any(Array)
      );
    });
  });

  describe('searchSpellById', () => {
    it('should return a spell object if found', async () => {
      const mockSpell = {
        id: 'uuid-mock-id',
        name: 'Lightning Strike',
        description: 'A powerful strike of lightning',
        manaCost: 40,
        damage: 120,
        duration: 3
      };

      pool.query.mockResolvedValue([[mockSpell]]);

      const spell = await SpellService.searchSpellById(mockSpell.id);

      expect(spell).toBeInstanceOf(Spell);
      expect(spell.id).toBe(mockSpell.id);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM spells WHERE id = ?', [mockSpell.id]);
    });

    it('should return null if no spell is found', async () => {
      pool.query.mockResolvedValue([[]]);

      const spell = await SpellService.searchSpellById('non-existing-id');

      expect(spell).toBeNull();
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM spells WHERE id = ?', ['non-existing-id']);
    });

    it('should throw an error if search fails', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(SpellService.searchSpellById('some-id')).rejects.toThrow('Database error');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM spells WHERE id = ?', ['some-id']);
    });
  });

  describe('updateSpell', () => {
    it('should update a spell and return true if successful', async () => {
      const spellData = {
        name: 'Chain Lightning',
        description: 'Lightning that strikes multiple targets',
        manaCost: 70,
        damage: 130,
        duration: 4
      };

      const mockResult = { affectedRows: 1 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await SpellService.updateSpell('uuid-mock-id', spellData);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE spells SET name = ?, description = ?, manaCost = ?, damage = ?, duration = ? WHERE id = ?',
        [spellData.name, spellData.description, spellData.manaCost, spellData.damage, spellData.duration, 'uuid-mock-id']
      );
    });

    it('should return false if no rows were affected (spell not found)', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await SpellService.updateSpell('non-existing-id', {});

      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE spells SET name = ?, description = ?, manaCost = ?, damage = ?, duration = ? WHERE id = ?',
        expect.any(Array)
      );
    });

    it('should throw an error if update fails', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(SpellService.updateSpell('some-id', {})).rejects.toThrow('Database error');
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE spells SET name = ?, description = ?, manaCost = ?, damage = ?, duration = ? WHERE id = ?',
        expect.any(Array)
      );
    });
  });

  describe('deleteSpell', () => {
    it('should delete a spell and return true if successful', async () => {
      const mockResult = { affectedRows: 1 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await SpellService.deleteSpell('uuid-mock-id');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM spells WHERE id = ?', ['uuid-mock-id']);
    });

    it('should return false if no rows were affected (spell not found)', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await SpellService.deleteSpell('non-existing-id');

      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM spells WHERE id = ?', ['non-existing-id']);
    });

    it('should throw an error if deletion fails', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(SpellService.deleteSpell('some-id')).rejects.toThrow('Database error');
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM spells WHERE id = ?', ['some-id']);
    });
  });

  describe('getAllSpells', () => {
    it('should return an array of spells', async () => {
      const mockSpells = [
        {
          id: 'uuid-1',
          name: 'Fireball',
          description: 'A ball of fire that causes damage',
          manaCost: 50,
          damage: 100,
          duration: 5
        },
        {
          id: 'uuid-2',
          name: 'Ice Blast',
          description: 'A chilling blast of ice',
          manaCost: 60,
          damage: 80,
          duration: 7
        }
      ];

      pool.query.mockResolvedValue([mockSpells]);

      const spells = await SpellService.getAllSpells();

      expect(spells).toHaveLength(2);
      expect(spells[0]).toBeInstanceOf(Spell);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM spells');
    });

    it('should throw an error if fetching spells fails', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(SpellService.getAllSpells()).rejects.toThrow('Database error');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM spells');
    });
  });
});
