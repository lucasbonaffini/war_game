const CharacterService = require('../../services/CharacterService');
const Character = require('../../models/Character');
const Gear = require('../../models/Gear');
const Weapon = require('../../models/Weapon');

jest.mock('../../models/Character');
jest.mock('../../models/Gear');
jest.mock('../../models/Weapon');

describe('CharacterService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new character', async () => {
    const mockCharacter = { id: '123', name: 'Test Character', race: 'Human', class_id: '1' };
    Character.create.mockResolvedValue(mockCharacter);

    const character = await CharacterService.createCharacter(mockCharacter);

    expect(Character.create).toHaveBeenCalledWith(mockCharacter);
    expect(character).toEqual(mockCharacter);
  });

  test('should get a character by id', async () => {
    const mockCharacter = { id: '123', name: 'Test Character', race: 'Human', class_id: '1' };
    Character.findByPk.mockResolvedValue(mockCharacter);

    const character = await CharacterService.getCharacterById('123');

    expect(Character.findByPk).toHaveBeenCalledWith('123');
    expect(character).toEqual(mockCharacter);
  });

  test('should update a character', async () => {
    const mockCharacter = { id: '123', name: 'Updated Character', race: 'Elf' };
    Character.update.mockResolvedValue([1]);

    const updated = await CharacterService.updateCharacter('123', mockCharacter);

    expect(Character.update).toHaveBeenCalledWith(mockCharacter, { where: { id: '123' } });
    expect(updated).toBeTruthy();
  });

  test('should delete a character', async () => {
    Character.destroy.mockResolvedValue(1);

    const deleted = await CharacterService.deleteCharacter('123');

    expect(Character.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(deleted).toBeTruthy();
  });

  test('should add gear to character', async () => {
    const mockCharacter = { id: '1', gear: [], save: jest.fn() };
    const mockGear = { id: '1', name: 'Helmet', ac: 50 };

    Character.findByPk.mockResolvedValue(mockCharacter);
    Gear.findByPk.mockResolvedValue(mockGear);

    const result = await CharacterService.addGear('1', '1');

    expect(Character.findByPk).toHaveBeenCalledWith('1');
    expect(Gear.findByPk).toHaveBeenCalledWith('1');
    expect(mockCharacter.gear).toContain(mockGear);
    expect(mockCharacter.save).toHaveBeenCalled();
    expect(result).toEqual(mockCharacter);
  });

  test('should add weapon to character', async () => {
    const mockCharacter = { id: '1', weapons: [], save: jest.fn() };
    const mockWeapon = { id: '1', name: 'Sword', damage: 100 };

    Character.findByPk.mockResolvedValue(mockCharacter);
    Weapon.findByPk.mockResolvedValue(mockWeapon);

    const result = await CharacterService.addWeapon('1', '1');

    expect(Character.findByPk).toHaveBeenCalledWith('1');
    expect(Weapon.findByPk).toHaveBeenCalledWith('1');
    expect(mockCharacter.weapons).toContain(mockWeapon);
    expect(mockCharacter.save).toHaveBeenCalled();
    expect(result).toEqual(mockCharacter);
  });

  test('should heal character', async () => {
    const mockCharacter = { id: '1', health: 50, maxHealth: 100, save: jest.fn() };
    Character.findByPk.mockResolvedValue(mockCharacter);

    const result = await CharacterService.heal('1', 30);

    expect(Character.findByPk).toHaveBeenCalledWith('1');
    expect(mockCharacter.health).toBe(80);
    expect(mockCharacter.save).toHaveBeenCalled();
    expect(result).toEqual(mockCharacter);
  });

  test('should not exceed max health when healing character', async () => {
    const mockCharacter = { id: '1', health: 90, maxHealth: 100, save: jest.fn() };
    Character.findByPk.mockResolvedValue(mockCharacter);

    const result = await CharacterService.heal('1', 20);

    expect(Character.findByPk).toHaveBeenCalledWith('1');
    expect(mockCharacter.health).toBe(100); // Should cap at maxHealth
    expect(mockCharacter.save).toHaveBeenCalled();
    expect(result).toEqual(mockCharacter);
  });

  test('should attack another character', async () => {
    const attacker = { id: '1', attackPower: 50, weapons: [], save: jest.fn() };
    const defender = { id: '2', health: 100, save: jest.fn() };

    Character.findByPk.mockResolvedValueOnce(attacker);
    Character.findByPk.mockResolvedValueOnce(defender);

    const result = await CharacterService.attack('1', '2');

    expect(Character.findByPk).toHaveBeenCalledWith('1');
    expect(Character.findByPk).toHaveBeenCalledWith('2');
    expect(defender.health).toBe(50); // 100 health - 50 attackPower
    expect(defender.save).toHaveBeenCalled();
    expect(result).toEqual(defender);
  });
});

