const CharacterService = require('../../services/CharacterService');
const Character = require('../../models/Character');
const pool = require('../../config/db');

jest.mock('../../models/Character', () => {
  return jest.fn().mockImplementation((id, name, race, classId, hp, maxHp, ac) => {
    return {
      id: id || '1',
      name,
      race,
      classId,
      hp,
      maxHp,
      ac,
      gear: [],
      potions: [],
      weapons: [],
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('CharacterService', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Limpiar los mocks después de cada prueba
  });

  test('should create a new character', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 100,
      maxHp: 100,
      ac: 50,
    };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const characterInstance = await CharacterService.createCharacter(mockCharacter);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO characters (id, name, race, classId, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mockCharacter.id, mockCharacter.name, mockCharacter.race, mockCharacter.classId, mockCharacter.hp, mockCharacter.maxHp, mockCharacter.ac]
    );
    expect(characterInstance).toEqual(mockCharacter);
  });

  test('should return all characters with associated items', async () => {
    const mockCharacters = [
      {
        id: '1',
        name: 'Aragorn',
        race: 'Human',
        classId: 1,
        hp: 100,
        maxHp: 100,
        ac: 50,
        gear: [],
        potions: [],
        weapons: [],
      },
      {
        id: '2',
        name: 'Legolas',
        race: 'Elf',
        classId: 2,
        hp: 80,
        maxHp: 80,
        ac: 40,
        gear: [],
        potions: [],
        weapons: [],
      },
    ];
    pool.query.mockResolvedValue([mockCharacters]);

    const characters = await CharacterService.getAllCharacters();

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters');
    expect(characters).toHaveLength(2);
    expect(characters[0].name).toBe('Aragorn');
    expect(characters[1].name).toBe('Legolas');
  });

  test('should return a character by id with associated items', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 100,
      maxHp: 100,
      ac: 50,
      gear: [],
      potions: [],
      weapons: [],
    };
    pool.query.mockResolvedValue([[mockCharacter]]);

    const characterInstance = await CharacterService.searchCharacterById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['1']);
    expect(characterInstance).toEqual(mockCharacter);
  });

  test('should return null if character not found by id', async () => {
    pool.query.mockResolvedValue([[]]); // Simula que no se encontró el personaje

    const characterInstance = await CharacterService.searchCharacterById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['999']);
    expect(characterInstance).toBeNull();
  });

  test('should update a character', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 100,
      maxHp: 100,
      ac: 50,
    };
    const updatedCharacterData = {
      name: 'Strider',
      race: 'Human',
      classId: 1,
      hp: 120,
      maxHp: 120,
      ac: 60,
    };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedCharacter = await CharacterService.updateCharacter('1', updatedCharacterData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, classId = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
      [updatedCharacterData.name, updatedCharacterData.race, updatedCharacterData.classId, updatedCharacterData.hp, updatedCharacterData.maxHp, updatedCharacterData.ac, '1']
    );
    expect(updatedCharacter).toBe(true);
  });

  test('should return false if character not found for update', async () => {
    const updatedCharacterData = {
      name: 'Strider',
      race: 'Human',
      classId: 1,
      hp: 120,
      maxHp: 120,
      ac: 60,
    };
    pool.query.mockResolvedValue({ affectedRows: 0 }); // Simula que no se encontró el personaje

    const updatedCharacter = await CharacterService.updateCharacter('999', updatedCharacterData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, classId = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
      [updatedCharacterData.name, updatedCharacterData.race, updatedCharacterData.classId, updatedCharacterData.hp, updatedCharacterData.maxHp, updatedCharacterData.ac, '999']
    );
    expect(updatedCharacter).toBe(false);
  });

  test('should delete a character by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await CharacterService.deleteCharacter('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if character not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 }); // Simula que no se encontró el personaje

    const result = await CharacterService.deleteCharacter('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });

  test('should add a weapon to a character', async () => {
    const mockWeapon = { id: 'weapon-1', name: 'Sword', category: 'Melee', damage: 50 };
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 100,
      maxHp: 100,
      ac: 50,
      weapons: [],
    };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const character = await CharacterService.addWeapon('1', mockWeapon.id);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)',
      ['1', mockWeapon.id]
    );
    expect(character.weapons.some(weapon => weapon.id === mockWeapon.id)).toBe(true);
  });

  test('should add gear to a character and update AC', async () => {
    const mockGear = { id: 'gear-1', name: 'Shield', ac: 20 };
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 100,
      maxHp: 100,
      ac: 50,
      gear: [],
    };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const character = await CharacterService.addGear('1', mockGear.id);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO character_gear (character_id, gear_id) VALUES (?, ?)',
      ['1', mockGear.id]
    );
    expect(character.gear.some(gear => gear.id === mockGear.id)).toBe(true);
    expect(character.ac).toBeGreaterThan(50);
  });

  test('should add a potion to a character', async () => {
    const mockPotion = { id: 'potion-1', name: 'Health Potion', effects: { hpRestore: 50 } };
    const mockCharacter = {
      id: '1',
      name: 'Aragorn',
      race: 'Human',
      classId: 1,
      hp: 100,
      maxHp: 100,
      ac: 50,
      potions: [],
    };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const character = await CharacterService.addPotion('1', mockPotion.id);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO character_potions (character_id, potion_id) VALUES (?, ?)',
      ['1', mockPotion.id]
    );
    expect(character.potions.some(potion => potion.id === mockPotion.id)).toBe(true);
  });
});
