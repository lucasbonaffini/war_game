// characterService.test.js

const CharacterService = require('../../services/CharacterService');
const WeaponService = require('../../services/WeaponService');
const GearService = require('../../services/GearService');
const PotionService = require('../../services/PotionService');
const ClassService = require('../../services/ClassService');
const pool = require('../../config/db');

jest.mock('../../config/db');
jest.mock('../../services/WeaponService');
jest.mock('../../services/GearService');
jest.mock('../../services/PotionService');
jest.mock('../../services/ClassService');

describe('CharacterService', () => {
  let mockCharacter;
  let mockWeapon;
  let mockGear;
  let mockPotion;
  let mockClass;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockCharacter = {
      id: 'character-1',
      name: 'Aragorn',
      race: 'Human',
      classId: 'class-1',
      hp: 1500,
      maxHp: 2000,
      ac: 500,
      weapons: [],
      gear: [],
      potions: [],
    };

    mockWeapon = {
      id: 'weapon-1',
      name: 'Anduril',
      category: 'Sword',
      damage: 300,
    };

    mockGear = {
      id: 'gear-1',
      name: 'Mithril Armor',
      category: 'Chestplate',
      armour: 400,
    };

    mockPotion = {
      id: 'potion-1',
      name: 'Elixir of Health',
      effects: { hpRestore: 500 },
      utility: 'Healing',
    };

    mockClass = {
      id: 'class-1',
      name: 'Barbarian',
      attributes: {
        strength: 50,
        dexterity: 20,
      },
    };
  });

  describe('createCharacter', () => {
    it('should successfully create a character', async () => {
      pool.query.mockResolvedValue([{ insertId: mockCharacter.id }]);

      const result = await CharacterService.createCharacter({
        name: mockCharacter.name,
        race: mockCharacter.race,
        classId: mockCharacter.classId,
        hp: mockCharacter.hp,
        maxHp: mockCharacter.maxHp,
        ac: mockCharacter.ac,
      });

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [result.id, mockCharacter.name, mockCharacter.race, mockCharacter.classId, mockCharacter.hp, mockCharacter.maxHp, mockCharacter.ac]
      );
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(mockCharacter.name);
      expect(result.race).toBe(mockCharacter.race);
    });

    it('should handle database insertion errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(
        CharacterService.createCharacter({
          name: mockCharacter.name,
          race: mockCharacter.race,
          classId: mockCharacter.classId,
          hp: mockCharacter.hp,
          maxHp: mockCharacter.maxHp,
          ac: mockCharacter.ac,
        })
      ).rejects.toThrow('Database error');

      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('searchCharacterById', () => {
    it('should retrieve a character along with associated gear, weapons, and potions', async () => {
      pool.query
        .mockResolvedValueOnce([[mockCharacter]]) // characters
        .mockResolvedValueOnce([[mockPotion]]) // potions
        .mockResolvedValueOnce([[mockWeapon]]) // weapons
        .mockResolvedValueOnce([[mockGear]]); // gear

      const result = await CharacterService.searchCharacterById(mockCharacter.id);

      expect(pool.query).toHaveBeenCalledTimes(4);
      expect(result).toHaveProperty('id', mockCharacter.id);
      expect(result).toHaveProperty('potions', [mockPotion]);
      expect(result).toHaveProperty('weapons', [mockWeapon]);
      expect(result).toHaveProperty('gear', [mockGear]);
    });

    it('should handle cases where the character is not found', async () => {
      pool.query.mockResolvedValueOnce([[]]); // characters

      await expect(CharacterService.searchCharacterById('invalid-id')).rejects.toThrow('Character not found');

      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during database queries', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(CharacterService.searchCharacterById(mockCharacter.id)).rejects.toThrow('Database error');

      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCharacter', () => {
    let mockConnection;

    beforeEach(() => {
      mockConnection = {
        beginTransaction: jest.fn(),
        query: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      };
      pool.getConnection.mockResolvedValue(mockConnection);
    });

    it('should successfully update character details and associations', async () => {
      mockConnection.query
        .mockResolvedValueOnce({ affectedRows: 1 }) // update character
        .mockResolvedValueOnce() // delete character_gears
        .mockResolvedValueOnce() // insert gear
        .mockResolvedValueOnce() // delete character_potions
        .mockResolvedValueOnce() // insert potion
        .mockResolvedValueOnce() // delete character_weapons
        .mockResolvedValueOnce(); // insert weapon

      await CharacterService.updateCharacter(mockCharacter.id, {
        name: 'Updated Name',
        race: 'Elf',
        classId: 'class-2',
        gear: ['gear-2'],
        potions: ['potion-2'],
        weapons: ['weapon-2'],
        hp: 1800,
        maxHp: 2000,
        ac: 600,
      });

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledWith(
        'UPDATE characters SET name = ?, race = ?, class_id = ?, hp = ?, maxHp = ?, ac = ? WHERE id = ?',
        ['Updated Name', 'Elf', 'class-2', 1800, 2000, 600, mockCharacter.id]
      );
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should handle cases where the character does not exist', async () => {
      mockConnection.query.mockResolvedValueOnce({ affectedRows: 0 });

      await expect(
        CharacterService.updateCharacter('invalid-id', {
          name: 'Updated Name',
          race: 'Elf',
          classId: 'class-2',
          gear: ['gear-2'],
          potions: ['potion-2'],
          weapons: ['weapon-2'],
          hp: 1800,
          maxHp: 2000,
          ac: 600,
        })
      ).rejects.toThrow('Something went wrong');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should handle transaction rollback on errors', async () => {
      mockConnection.query.mockRejectedValue(new Error('Update error'));

      await expect(
        CharacterService.updateCharacter(mockCharacter.id, {
          name: 'Updated Name',
          race: 'Elf',
          classId: 'class-2',
          gear: ['gear-2'],
          potions: ['potion-2'],
          weapons: ['weapon-2'],
          hp: 1800,
          maxHp: 2000,
          ac: 600,
        })
      ).rejects.toThrow('Something went wrong');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('deleteCharacter', () => {
    let mockConnection;

    beforeEach(() => {
      mockConnection = {
        beginTransaction: jest.fn(),
        query: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      };
      pool.getConnection.mockResolvedValue(mockConnection);
    });

    it('should successfully delete a character and associated records', async () => {
      mockConnection.query
        .mockResolvedValueOnce() // delete character_gears
        .mockResolvedValueOnce() // delete character_potions
        .mockResolvedValueOnce() // delete character_weapons
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // delete character

      const result = await CharacterService.deleteCharacter(mockCharacter.id);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.query).toHaveBeenCalledTimes(4);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle cases where the character does not exist', async () => {
      mockConnection.query
        .mockResolvedValueOnce() // delete character_gears
        .mockResolvedValueOnce() // delete character_potions
        .mockResolvedValueOnce() // delete character_weapons
        .mockResolvedValueOnce([{ affectedRows: 0 }]); // delete character

      await expect(CharacterService.deleteCharacter('invalid-id')).rejects.toThrow('Character not found');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should handle errors during deletion', async () => {
      mockConnection.query.mockRejectedValue(new Error('Deletion error'));

      await expect(CharacterService.deleteCharacter(mockCharacter.id)).rejects.toThrow('Deletion error');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('getAllCharacters', () => {
    it('should retrieve all characters with their associated gear, weapons, and potions', async () => {
      const characterRows = [mockCharacter];
      const gearRows = [{ character_id: mockCharacter.id, ...mockGear }];
      const potionRows = [{ character_id: mockCharacter.id, ...mockPotion }];
      const weaponRows = [{ character_id: mockCharacter.id, ...mockWeapon }];

      pool.query
        .mockResolvedValueOnce([characterRows]) // characters
        .mockResolvedValueOnce([gearRows]) // gear
        .mockResolvedValueOnce([potionRows]) // potions
        .mockResolvedValueOnce([weaponRows]); // weapons

      const result = await CharacterService.getAllCharacters();

      expect(pool.query).toHaveBeenCalledTimes(4);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', mockCharacter.id);
      expect(result[0]).toHaveProperty('gear', [
        {
          id: mockGear.id,
          name: mockGear.name,
          category: mockGear.category,
          armour: mockGear.armour,
        },
      ]);
      expect(result[0]).toHaveProperty('potions', [
        {
          id: mockPotion.id,
          name: mockPotion.name,
          effects: mockPotion.effects,
          utility: mockPotion.utility,
        },
      ]);
      expect(result[0]).toHaveProperty('weapons', [
        {
          id: mockWeapon.id,
          name: mockWeapon.name,
          category: mockWeapon.category,
          damage: mockWeapon.damage,
        },
      ]);
    });

    it('should handle empty character lists', async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // characters
        .mockResolvedValueOnce([[]]) // gear
        .mockResolvedValueOnce([[]]) // potions
        .mockResolvedValueOnce([[]]); // weapons

      const result = await CharacterService.getAllCharacters();

      expect(pool.query).toHaveBeenCalledTimes(4);
      expect(result).toHaveLength(0);
    });

    it('should handle errors during data retrieval', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(CharacterService.getAllCharacters()).rejects.toThrow('Database error');

      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('addWeapon', () => {
    it('should successfully add a weapon to a character', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue({ ...mockCharacter, weapons: [] });
      WeaponService.searchWeaponById.mockResolvedValue(mockWeapon);
      pool.query.mockResolvedValueOnce([[]]).mockResolvedValueOnce();

      const result = await CharacterService.addWeapon(mockCharacter.id, mockWeapon.id);

      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(mockCharacter.id);
      expect(WeaponService.searchWeaponById).toHaveBeenCalledWith(mockWeapon.id);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM character_weapons WHERE character_id = ? AND weapon_id = ?',
        [mockCharacter.id, mockWeapon.id]
      );
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)',
        [mockCharacter.id, mockWeapon.id]
      );
      expect(result.weapons).toContainEqual(mockWeapon);
    });

    it('should handle cases where the character does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(null);

      await expect(CharacterService.addWeapon('invalid-id', mockWeapon.id)).rejects.toThrow('Character not found');

      //expect(CharacterService.searchCharacterById).toHaveBeenCalledWith('invalid-id');
      expect(WeaponService.searchWeaponById).not.toHaveBeenCalled();
    });

    it('should handle cases where the weapon does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      WeaponService.searchWeaponById.mockResolvedValue(null);

      await expect(CharacterService.addWeapon(mockCharacter.id, 'invalid-weapon-id')).rejects.toThrow('Weapon not found');

      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(mockCharacter.id);
      expect(WeaponService.searchWeaponById).toHaveBeenCalledWith('invalid-weapon-id');
    });

    it('should handle cases where the weapon is already added', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      WeaponService.searchWeaponById.mockResolvedValue(mockWeapon);
      pool.query.mockResolvedValueOnce([[mockWeapon]]);

      await expect(CharacterService.addWeapon(mockCharacter.id, mockWeapon.id)).rejects.toThrow(
        'Weapon already added to this character'
      );

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM character_weapons WHERE character_id = ? AND weapon_id = ?',
        [mockCharacter.id, mockWeapon.id]
      );
    });

    it('should handle errors during database operations', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      WeaponService.searchWeaponById.mockResolvedValue(mockWeapon);
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(CharacterService.addWeapon(mockCharacter.id, mockWeapon.id)).rejects.toThrow('Database error');
    });
  });

  describe('addGear', () => {
    it('should successfully add gear to a character and update AC accordingly', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue({ ...mockCharacter, gear: [] });
      GearService.searchGearById.mockResolvedValue(mockGear);
      pool.query
        .mockResolvedValueOnce([[]]) // check existing gear
        .mockResolvedValueOnce() // insert gear
        .mockResolvedValueOnce(); // update character AC

      const result = await CharacterService.addGear(mockCharacter.id, mockGear.id);

      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(mockCharacter.id);
      expect(GearService.searchGearById).toHaveBeenCalledWith(mockGear.id);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM character_gear WHERE character_id = ? AND gear_id = ?',
        [mockCharacter.id, mockGear.id]
      );
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO character_gear (character_id, gear_id) VALUES (?, ?)',
        [mockCharacter.id, mockGear.id]
      );
      expect(pool.query).toHaveBeenCalledWith('UPDATE characters SET ac = ? WHERE id = ?', [900, mockCharacter.id]);
      expect(result.ac).toBe(900);
      expect(result.gear).toContainEqual(mockGear);
    });

    it('should ensure AC does not exceed 1000', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue({ ...mockCharacter, ac: 800, gear: [] });
      GearService.searchGearById.mockResolvedValue(mockGear);
      pool.query
        .mockResolvedValueOnce([[]]) // check existing gear
        .mockResolvedValueOnce() // insert gear
        .mockResolvedValueOnce(); // update character AC

      const result = await CharacterService.addGear(mockCharacter.id, mockGear.id);

      expect(pool.query).toHaveBeenCalledWith('UPDATE characters SET ac = ? WHERE id = ?', [1000, mockCharacter.id]);
      expect(result.ac).toBe(1000);
    });

    it('should handle cases where the character does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(null);

      await expect(CharacterService.addGear('invalid-id', mockGear.id)).rejects.toThrow('Character not found');

      expect(GearService.searchGearById).not.toHaveBeenCalled();
    });

    it('should handle cases where the gear does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      GearService.searchGearById.mockResolvedValue(null);

      await expect(CharacterService.addGear(mockCharacter.id, 'invalid-gear-id')).rejects.toThrow('Gear not found');
    });

    it('should handle cases where the gear is already added', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      GearService.searchGearById.mockResolvedValue(mockGear);
      pool.query.mockResolvedValueOnce([[mockGear]]);

      await expect(CharacterService.addGear(mockCharacter.id, mockGear.id)).rejects.toThrow(
        "Weapon already exists in character's inventory"
      );
    });

    it('should handle errors during database operations', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      GearService.searchGearById.mockResolvedValue(mockGear);
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(CharacterService.addGear(mockCharacter.id, mockGear.id)).rejects.toThrow('Database error');
    });
  });

  describe('addPotion', () => {
    it('should successfully add a potion to a character', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue({ ...mockCharacter, potions: [] });
      PotionService.searchPotionById.mockResolvedValue(mockPotion);
      pool.query
        .mockResolvedValueOnce([[]]) // check existing potion
        .mockResolvedValueOnce(); // insert potion

      const result = await CharacterService.addPotion(mockCharacter.id, mockPotion.id);

      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(mockCharacter.id);
      expect(PotionService.searchPotionById).toHaveBeenCalledWith(mockPotion.id);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM character_potions WHERE character_id = ? AND potion_id = ?',
        [mockCharacter.id, mockPotion.id]
      );
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO character_potions (character_id, potion_id) VALUES (?, ?)',
        [mockCharacter.id, mockPotion.id]
      );
      expect(result.potions).toContainEqual(mockPotion);
    });

    it('should handle cases where the character does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(null);

      await expect(CharacterService.addPotion('invalid-id', mockPotion.id)).rejects.toThrow('Character not found');

      expect(PotionService.searchPotionById).not.toHaveBeenCalled();
    });

    it('should handle cases where the potion does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      PotionService.searchPotionById.mockResolvedValue(null);

      await expect(CharacterService.addPotion(mockCharacter.id, 'invalid-potion-id')).rejects.toThrow('Potion not found');
    });

    it('should handle cases where the potion is already added', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      PotionService.searchPotionById.mockResolvedValue(mockPotion);
      pool.query.mockResolvedValueOnce([[mockPotion]]);

      await expect(CharacterService.addPotion(mockCharacter.id, mockPotion.id)).rejects.toThrow(
        "Potion already exists in character's inventory"
      );
    });

    it('should handle errors during database operations', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
      PotionService.searchPotionById.mockResolvedValue(mockPotion);
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(CharacterService.addPotion(mockCharacter.id, mockPotion.id)).rejects.toThrow('Database error');
    });
  });

  describe('attack', () => {
    it('should successfully perform an attack and update target HP accordingly', async () => {
      const attacker = { ...mockCharacter, weapons: [mockWeapon], classId: mockClass.id, name: 'Attacker' };
      const target = { ...mockCharacter, hp: 1500, ac: 200, name: 'Target', id: 'target-1' };

      jest.spyOn(CharacterService, 'searchCharacterById')
        .mockResolvedValueOnce(attacker) // attacker
        .mockResolvedValueOnce(target); // target
      ClassService.searchClassById.mockResolvedValue(mockClass);
      pool.query.mockResolvedValueOnce(); // update target HP

      const result = await CharacterService.attack(attacker.id, target.id, mockWeapon.id);

      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(attacker.id);
      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(target.id);
      expect(ClassService.searchClassById).toHaveBeenCalledWith(attacker.classId);
      expect(pool.query).toHaveBeenCalledWith('UPDATE characters SET hp = ? WHERE id = ?', [1150, target.id]);
      expect(result.message).toBe(
        'Attacker attacked Target with Anduril, dealing 300 damage and 50 bonus for a total of 350'
      );
    });

    it('should handle cases where attacker, target, or weapon does not exist', async () => {
      jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValueOnce(null);

      await expect(CharacterService.attack('invalid-id', 'target-id', mockWeapon.id)).rejects.toThrow(
        'Character not Found'
      );

      expect(ClassService.searchClassById).not.toHaveBeenCalled();
    });

    it('should handle cases where the weapon does not belong to the attacker', async () => {
      const attacker = { ...mockCharacter, weapons: [], classId: mockClass.id, name: 'Attacker' };
      const target = { ...mockCharacter, hp: 1500, ac: 200, name: 'Target', id: 'target-1' };

      jest.spyOn(CharacterService, 'searchCharacterById')
        .mockResolvedValueOnce(attacker) // attacker
        .mockResolvedValueOnce(target); // target

      await expect(CharacterService.attack(attacker.id, target.id, mockWeapon.id)).rejects.toThrow(
        'Weapon not found or does not belong to the attacker'
      );
    });

    it('should handle target death scenario', async () => {
      const attacker = { ...mockCharacter, weapons: [mockWeapon], classId: mockClass.id, name: 'Attacker' };
      const target = { ...mockCharacter, hp: 300, ac: 200, name: 'Target', id: 'target-1' };

      jest.spyOn(CharacterService, 'searchCharacterById')
        .mockResolvedValueOnce(attacker) // attacker
        .mockResolvedValueOnce(target); // target
      ClassService.searchClassById.mockResolvedValue(mockClass);
      pool.query.mockResolvedValueOnce(); // update target HP

      const result = await CharacterService.attack(attacker.id, target.id, mockWeapon.id);

      expect(pool.query).toHaveBeenCalledWith('UPDATE characters SET hp = ? WHERE id = ?', [0, target.id]);
      expect(result.message).toBe(
        'Attacker attacked Target with Anduril, dealing 300 damage and 50 bonus for a total of 350. Target has been defeated.'
      );
    });
  });
    
});

describe('heal', () => {
  test('should heal the character successfully', async () => {
    const mockCharacter = {
      id: 'character-1',
      name: 'Gandalf',
      hp: 100,
      maxHp: 150,
      potions: [{ id: 'potion-1', effects: { hpRestore: 30 } }]
    };
    
    // Mocks
    CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
    pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // for updating HP
    pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // for removing potion

    const result = await CharacterService.heal('character-1');

    expect(result.message).toContain('has been healed by 30 HP');
    expect(result.character.hp).toBe(130);
    expect(pool.query).toHaveBeenCalledWith('UPDATE characters SET hp = ? WHERE id = ?', [130, 'character-1']);
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM character_potions WHERE character_id = ? AND potion_id = ?', ['character-1', 'potion-1']);
  });

  test('should throw an error if character is not found', async () => {
    CharacterService.searchCharacterById = jest.fn().mockResolvedValue(null);

    await expect(CharacterService.heal('invalid-id')).rejects.toThrow('Character not found');
  });

  test('should throw an error if no healing potion is available', async () => {
    const mockCharacter = {
      id: 'character-2',
      name: 'Aragorn',
      hp: 100,
      maxHp: 150,
      potions: [] // No healing potion
    };

    CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);

    await expect(CharacterService.heal('character-2')).rejects.toThrow("Potion does not exist in character's inventory");
  });

  test('should throw an error if HP is already full', async () => {
    const mockCharacter = {
      id: 'character-3',
      name: 'Legolas',
      hp: 150,
      maxHp: 150,
      potions: [{ id: 'potion-2', effects: { hpRestore: 30 } }]
    };

    CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);

    await expect(CharacterService.heal('character-3')).rejects.toThrow('Your HP is full! Keep fighting, warrior!');
  });

  test('should handle database errors during update', async () => {
    const mockCharacter = {
      id: 'character-4',
      name: 'Gimli',
      hp: 50,
      maxHp: 100,
      potions: [{ id: 'potion-3', effects: { hpRestore: 20 } }]
    };

    CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
    pool.query.mockRejectedValueOnce(new Error('Database error')); // For updating HP

    await expect(CharacterService.heal('character-4')).rejects.toThrow('Database error');
  });
});











