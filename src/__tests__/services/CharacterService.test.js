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
    // Mock character data
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      class_id: '1',
      hp: 2000,
      maxHp: 2000,
      ac: 0
    };
  
    // Mock gear, potions, and weapons data
    const mockGear = [
      { character_id: '1', id: 'gear1', name: 'Helmet', category: 'Head', armour: 10 }
    ];
    const mockPotions = [
      { character_id: '1', id: 'potion1', name: 'Health Potion', effects: '{"hpRestore": 200}', utility: 'restore' }
    ];
    const mockWeapons = [
      { character_id: '1', id: 'weapon1', name: 'Sword', category: 'Melee', damage: 100 }
    ];
  
    // Mock database queries
    pool.query
      .mockResolvedValueOnce([mockCharacter])    // For character query
      .mockResolvedValueOnce(mockGear)           // For gear query
      .mockResolvedValueOnce(mockPotions)        // For potions query
      .mockResolvedValueOnce(mockWeapons);       // For weapons query
  
    const characterInstance = await CharacterService.searchCharacterById('1');
  
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['1']);
    expect(pool.query).toHaveBeenCalledWith('SELECT cg.character_id, g.* FROM character_gear cg JOIN gears g ON cg.gear_id = g.id WHERE cg.character_id = ?', ['1']);
    expect(pool.query).toHaveBeenCalledWith('SELECT cp.character_id, p.* FROM character_potions cp JOIN potions p ON cp.potion_id = p.id WHERE cp.character_id = ?', ['1']);
    expect(pool.query).toHaveBeenCalledWith('SELECT cw.character_id, w.* FROM character_weapons cw JOIN weapons w ON cw.weapon_id = w.id WHERE cw.character_id = ?', ['1']);
    
    // Check if the character instance is as expected
    expect(characterInstance).toEqual(new Character(
      '1',
      'Aragorn',
      'Human',
      '1',
      mockGear,
      mockPotions.map(potion => ({
        ...potion,
        effects: JSON.parse(potion.effects)
      })),
      mockWeapons,
      2000,
      2000,
      0
    ));
  });
  
    
});

