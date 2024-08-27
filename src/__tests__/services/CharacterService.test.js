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
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: '1',
      gear: [],
      potions: [],
      weapons: [],
      hp: 2000,
      maxHp: 2000,
      ac: 0
    };
  
    pool.query.mockResolvedValue([{ insertId: '1' }]);
    
    const characterInstance = await CharacterService.createCharacter(mockCharacter);
  
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mockCharacter.id, mockCharacter.name, mockCharacter.race, mockCharacter.classId, mockCharacter.hp, mockCharacter.maxHp, mockCharacter.ac]
    );
    
    
    expect(characterInstance).toEqual({
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: '1',
      gear: [],
      potions: [],
      weapons: [],
      hp: 2000,
      maxHp: 2000,
      ac: 0
    });
  });
  
  test('should return a character by id', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: '1',
      gear: [],
      potions: [],
      weapons: [],
      hp: 2000,
      maxHp: 2000,
      ac: 0
    };
  
    
    pool.query.mockResolvedValue([[mockCharacter]]);
  
    const characterInstance = await CharacterService.searchCharacterById('1');
  
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['1']);
    expect(characterInstance).toEqual(mockCharacter);
  });
  
  test('should return null if character not found by id', async () => {
    // Mock la respuesta de la consulta para un ID no encontrado
    pool.query.mockResolvedValue([[]]);
  
    const characterInstance = await CharacterService.searchCharacterById('999');
  
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['999']);
    expect(characterInstance).toBeNull();
  });
  

});

