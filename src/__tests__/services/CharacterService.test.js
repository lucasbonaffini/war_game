const CharacterService = require('../../services/CharacterService');
const Character = require('../../models/Character');
const pool = require('../../config/db');

// Mocking the Character model
jest.mock('../../models/Character', () => {
  return jest.fn().mockImplementation((id, name, race, classId, gear, potions, weapons, hp, maxHp, ac) => {
    return {
      id: id || '1',
      name,
      race,
      classId,
      gear,
      potions,
      weapons,
      hp,
      maxHp,
      ac,
    };
  });
});

// Mocking the database pool
jest.mock('../../config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn().mockResolvedValue({
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  }),
}));

describe('CharacterService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new character', async () => {
    const mockCharacter = { id: '1', name: 'Aragorn', race: 'Human', classId: '1', hp: 2000, maxHp: 2000, ac: 0 };
    pool.query.mockResolvedValue([{ insertId: '1' }]);
    
    const characterInstance = await CharacterService.createCharacter(mockCharacter);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [characterInstance.id, characterInstance.name, characterInstance.race, characterInstance.classId, characterInstance.hp, characterInstance.maxHp, characterInstance.ac]
    );
    expect(characterInstance).toEqual(mockCharacter);
  });

  test('should return all characters with their gear, potions, and weapons', async () => {
    const mockCharacters = [
      { id: '1', name: 'Aragorn', race: 'Human', class_id: '1', hp: 2000, maxHp: 2000, ac: 0 },
      { id: '2', name: 'Legolas', race: 'Elf', class_id: '2', hp: 1800, maxHp: 1800, ac: 5 },
    ];
    const mockGear = [{ character_id: '1', id: 'gear1', name: 'Helmet', category: 'Head', armour: 10 }];
    const mockPotions = [{ character_id: '1', id: 'potion1', name: 'Health Potion', effects: '{"hpRestore": 200}', utility: 'restore' }];
    const mockWeapons = [{ character_id: '1', id: 'weapon1', name: 'Sword', category: 'Melee', damage: 100 }];

    pool.query.mockResolvedValueOnce([mockCharacters])
      .mockResolvedValueOnce([mockGear])
      .mockResolvedValueOnce([mockPotions])
      .mockResolvedValueOnce([mockWeapons]);

    const characters = await CharacterService.getAllCharacters();

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters');
    expect(pool.query).toHaveBeenCalledWith('SELECT cg.character_id, g.* FROM character_gear cg JOIN gears g ON cg.gear_id = g.id');
    expect(pool.query).toHaveBeenCalledWith('SELECT cp.character_id, p.* FROM character_potions cp JOIN potions p ON cp.potion_id = p.id');
    expect(pool.query).toHaveBeenCalledWith('SELECT cw.character_id, w.* FROM character_weapons cw JOIN weapons w ON cw.weapon_id = w.id');
    
    expect(characters).toHaveLength(2);
    expect(characters[0].gear).toHaveLength(1);
    expect(characters[0].potions).toHaveLength(1);
    expect(characters[0].weapons).toHaveLength(1);
  });

  test('should return a character by id', async () => {
    const mockCharacter = { id: '1', name: 'Aragorn', race: 'Human', class_id: '1', hp: 2000, maxHp: 2000, ac: 0 };
    pool.query.mockResolvedValue([[mockCharacter]]);

    const characterInstance = await CharacterService.searchCharacterById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['1']);
    expect(characterInstance).toEqual(mockCharacter);
  });

  test('should return null if character not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const characterInstance = await CharacterService.searchCharacterById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['999']);
    expect(characterInstance).toBeNull();
  });

  test('should update a character', async () => {
    const mockCharacter = { id: '1', name: 'Aragorn', race: 'Human', class_id: '1', hp: 2000, maxHp: 2000, ac: 0 };
    const updatedCharacterData = { name: 'Updated Aragorn', race: 'Human', classId: '1', gear: [], potions: [], weapons: [], hp: 2500, maxHp: 2500, ac: 10 };
    const mockConnection = await pool.getConnection();

    mockConnection.query.mockResolvedValue({ affectedRows: 1 });

    const result = await CharacterService.updateCharacter('1', updatedCharacterData);

    expect(mockConnection.query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, class_id = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
      [updatedCharacterData.name, updatedCharacterData.race, updatedCharacterData.classId, updatedCharacterData.hp, updatedCharacterData.maxHp, updatedCharacterData.ac, '1']
    );
    expect(result).toBe(true);
  });

  test('should return false if character not found for update', async () => {
    const updatedCharacterData = { name: 'Updated Aragorn', race: 'Human', classId: '1', gear: [], potions: [], weapons: [], hp: 2500, maxHp: 2500, ac: 10 };
    const mockConnection = await pool.getConnection();

    mockConnection.query.mockResolvedValue({ affectedRows: 0 });

    const result = await CharacterService.updateCharacter('999', updatedCharacterData);

    expect(mockConnection.query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, class_id = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
      [updatedCharacterData.name, updatedCharacterData.race, updatedCharacterData.classId, updatedCharacterData.hp, updatedCharacterData.maxHp, updatedCharacterData.ac, '999']
    );
    expect(result).toBe(false);
  });

  test('should delete a character by id', async () => {
    const mockConnection = await pool.getConnection();
    mockConnection.query.mockResolvedValue({ affectedRows: 1 });

    const result = await CharacterService.deleteCharacter('1');

    expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if character not found for deletion', async () => {
    const mockConnection = await pool.getConnection();
    mockConnection.query.mockResolvedValue({ affectedRows: 0 });

    const result = await CharacterService.deleteCharacter('999');

    expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
});

