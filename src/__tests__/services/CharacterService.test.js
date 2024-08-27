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
});

