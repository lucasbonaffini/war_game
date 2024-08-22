const CharacterService = require('../../services/CharacterService');
const pool = require('../../config/db.js'); // Asegúrate de que la ruta sea correcta

// Mock de la base de datos
jest.mock('../../config/db.js', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

describe('CharacterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new character', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      ac: 50,
    };

    pool.query.mockResolvedValue([{ insertId: 1 }]);

    const characterInstance = await CharacterService.createCharacter(mockCharacter);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mockCharacter.id, mockCharacter.name, mockCharacter.race, mockCharacter.classId, mockCharacter.ac] // Valores predeterminados para hp y maxHp
    );
    expect(characterInstance).toEqual({ insertId: 1 });
  });

  it('should return a character by id with associated items', async () => {
    const mockId = '1';
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 1000, // Asumiendo valor predeterminado
      maxHp: 1000, // Asumiendo valor predeterminado
      ac: 50,
      weapons: [],
      gear: [],
      potions: [],
    };

    pool.query.mockResolvedValueOnce([[mockCharacter]]);
    pool.query.mockResolvedValueOnce([[]]); // Mock empty results for weapons
    pool.query.mockResolvedValueOnce([[]]); // Mock empty results for gear
    pool.query.mockResolvedValueOnce([[]]); // Mock empty results for potions

    const character = await CharacterService.searchCharacterById(mockId);

    expect(character).toEqual(mockCharacter);
  });

  it('should update a character', async () => {
    const mockId = '1';
    const updateData = {
      name: 'Aragorn Updated',
      race: 'Human',
      classId: 1,
      ac: 60,
    };

    pool.getConnection.mockResolvedValue({
      beginTransaction: jest.fn(),
      query: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    });

    await CharacterService.updateCharacter(mockId, updateData);

    expect(pool.getConnection).toHaveBeenCalled();
    expect(pool.getConnection().query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, class_id = ?, ac = ? WHERE id = ?',
      [updateData.name, updateData.race, updateData.classId, updateData.ac, mockId]
    );
  });

  it('should delete a character by id', async () => {
    const mockId = '1';

    pool.getConnection.mockResolvedValue({
      beginTransaction: jest.fn(),
      query: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    });

    await CharacterService.deleteCharacter(mockId);

    expect(pool.getConnection).toHaveBeenCalled();
    expect(pool.getConnection().query).toHaveBeenCalledWith(
      'DELETE FROM characters WHERE id = ?',
      [mockId]
    );
  });

  it('should add a weapon to a character', async () => {
    const mockId = '1';
    const weapon = { id: '1', name: 'Sword', damage: 50 };

    pool.query.mockResolvedValueOnce([[{ id: mockId }]]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await CharacterService.addWeapon(mockId, weapon);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)',
      [mockId, weapon.id]
    );
  });

  it('should add gear to a character and update AC', async () => {
    const mockId = '1';
    const gear = { id: '1', name: 'Shield', ac: 10 };

    pool.query.mockResolvedValueOnce([[{ id: mockId }]]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    pool.query.mockResolvedValueOnce([[{ ac: 50 }]]);

    await CharacterService.addGear(mockId, gear);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO character_gears (character_id, gear_id) VALUES (?, ?)',
      [mockId, gear.id]
    );
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE characters SET ac = ? WHERE id = ?',
      [60, mockId]
    );
  });

  it('should add a potion to a character', async () => {
    const mockId = '1';
    const potion = { id: '1', name: 'Health Potion' };

    pool.query.mockResolvedValueOnce([[{ id: mockId }]]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await CharacterService.addPotion(mockId, potion);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO character_potions (character_id, potion_id) VALUES (?, ?)',
      [mockId, potion.id]
    );
  });
});
