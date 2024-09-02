const WizardService = require('../../services/WizardService');
const SpellService = require('../../services/SpellService');
const CharacterService = require('../../services/CharacterService');
const ClassService = require('../../services/ClassService');
const pool = require('../../config/db');
const Wizard = require('../../models/Wizard');
const Spell = require('../../models/Spell');

jest.mock('../../config/db');
jest.mock('../../services/CharacterService');
jest.mock('../../services/SpellService');
jest.mock('../../services/ClassService');

describe('WizardService', () => {
  let mockCharacter, mockWizard, mockSpell, mockClass, mockManaPotion;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockCharacter = {
      id: 'character-1',
      name: 'Gandalf',
      race: 'Human',
      classId: 'class-1',
      gear: [],
      potions: [],
      weapons: [],
      hp: 1000,
      maxHp: 1000,
      ac: 10,
    };

    mockManaPotion = {
        id: 'potion-1',
        name: 'Elixir of Mana',
        effects: { manaRestore: 500 },
        utility: 'Mana Restore',
    }

    mockWizard = {
      ...mockCharacter,
      mana: 1000,
      maxMana: 1500,
      spells: [],
    };

    mockSpell = {
      id: 'spell-1',
      name: 'Fireball',
      damage: 300,
      manaCost: 100,
      duration: 0,
    };

    mockClass = {
      id: 'class-1',
      name: 'Wizard',
    };

    
  });

  describe('createWizard', () => {
    it('should create a wizard successfully', async () => {
      pool.getConnection.mockResolvedValue({ query: jest.fn().mockResolvedValue([{ insertId: 1 }]), release: jest.fn() });
      ClassService.searchClassById.mockResolvedValue(mockClass);
      CharacterService.createCharacter.mockResolvedValue(mockCharacter);

      const result = await WizardService.createWizard({
        name: mockCharacter.name,
        race: mockCharacter.race,
        classId: mockCharacter.classId,
        hp: mockCharacter.hp,
        maxHp: mockCharacter.maxHp,
        ac: mockCharacter.ac,
      });

      expect(ClassService.searchClassById).toHaveBeenCalledWith(mockCharacter.classId);
      expect(CharacterService.createCharacter).toHaveBeenCalledWith({
        name: mockCharacter.name,
        race: mockCharacter.race,
        classId: mockCharacter.classId,
        hp: mockCharacter.hp,
        maxHp: mockCharacter.maxHp,
        ac: mockCharacter.ac,
      });
      expect(result).toBeInstanceOf(Wizard);
    });

    it('should throw an error if the class is not Wizard', async () => {
      ClassService.searchClassById.mockResolvedValue({ name: 'Warrior' });

      await expect(WizardService.createWizard(mockWizard)).rejects.toThrow('Invalid class ID for Wizard');
    });
  });

  describe('searchWizardById', () => {
    it('should return a wizard with spells', async () => {
      pool.query.mockResolvedValueOnce([[{ character_id: mockCharacter.id, mana: 1000, maxMana: 1000 }]]);
      pool.query.mockResolvedValueOnce([[mockSpell]]);
      CharacterService.searchCharacterById.mockResolvedValue(mockCharacter);
      ClassService.searchClassById.mockResolvedValue(mockClass);

      const result = await WizardService.searchWizardById(mockCharacter.id);

      expect(CharacterService.searchCharacterById).toHaveBeenCalledWith(mockCharacter.id);
      expect(result.mana).toBe(1000);
      expect(result.spells).toHaveLength(1);
    });

    it('should return null if wizard is not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      CharacterService.searchCharacterById.mockResolvedValue(mockCharacter);

      const result = await WizardService.searchWizardById('invalid-id');

      expect(result).toBeNull();
    });

    it('should return wizard with spells and handle not found', async () => {
        pool.query.mockResolvedValueOnce([[{ character_id: mockCharacter.id, mana: 1000, maxMana: 1000 }]]);
        pool.query.mockResolvedValueOnce([[mockSpell]]);
        CharacterService.searchCharacterById.mockResolvedValue(mockCharacter);
        ClassService.searchClassById.mockResolvedValue(mockClass);
  
        const result = await WizardService.searchWizardById(mockCharacter.id);
  
        expect(result.mana).toBe(1000);
        expect(result.spells).toHaveLength(1);
  
        pool.query.mockResolvedValueOnce([[]]);
        const resultNotFound = await WizardService.searchWizardById('invalid-id');
        expect(resultNotFound).toBeNull();
      });
  });

  describe('updateWizard', () => {
    it('should update wizard successfully', async () => {
      pool.getConnection.mockResolvedValue({
        query: jest.fn(),
        commit: jest.fn(),
        release: jest.fn(),
        beginTransaction: jest.fn(),
        rollback: jest.fn(),
      });
      CharacterService.updateCharacter.mockResolvedValue(mockCharacter);
      ClassService.searchClassById.mockResolvedValue(mockClass);

      const result = await WizardService.updateWizard(mockCharacter.id, {
        name: 'New Wizard',
        spells: [mockSpell],
        mana: 800,
        maxMana: 1000,
      });

      expect(result.mana).toBe(800);
      expect(result.spells).toHaveLength(1);
    });

    it('should throw an error if class is not Wizard', async () => {
      ClassService.searchClassById.mockResolvedValue({ name: 'Warrior' });

      await expect(WizardService.updateWizard(mockCharacter.id, {})).rejects.toThrow('Invalid class ID for Wizard');
    });
  });

  describe('deleteWizard', () => {
    it('should delete wizard and associated spells', async () => {
      pool.getConnection.mockResolvedValue({
        query: jest.fn(),
        commit: jest.fn(),
        release: jest.fn(),
        beginTransaction: jest.fn(),
        rollback: jest.fn(),
      });

      const result = await WizardService.deleteWizard(mockCharacter.id);

      expect(result).toBe(true);
    });
  });

  describe('addSpell', () => {
    it('should add a spell to wizard', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      SpellService.searchSpellById.mockResolvedValue(mockSpell);
      WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);

      const result = await WizardService.addSpell(mockCharacter.id, mockSpell.id);

      expect(result.spells).toHaveLength(1);
      expect(result.spells[0]).toEqual(mockSpell);
    });

    it('should throw an error if the spell already exists', async () => {
      pool.query.mockResolvedValueOnce([[{ character_id: mockCharacter.id, spell_id: mockSpell.id }]]);

      await expect(WizardService.addSpell(mockCharacter.id, mockSpell.id)).rejects.toThrow('Spell already added to this character');
    });
  });

  describe('castSpell', () => {
    it('should cast a spell and deal damage', async () => {
      pool.query.mockResolvedValue({ commit: jest.fn(), release: jest.fn() });
      SpellService.searchSpellById.mockResolvedValue(mockSpell);
      CharacterService.searchCharacterById.mockResolvedValue({ ...mockCharacter, hp: 300 });

      WizardService.searchWizardById = jest.fn().mockResolvedValue({
        ...mockWizard,
        spells: [mockSpell],
        mana: 1000,
      });

      const result = await WizardService.castSpell(mockCharacter.id, 'target-id', mockSpell.id);

      expect(result.message).toContain('dealing 300 damage');
    });

    it('should throw an error if not enough mana', async () => {
      WizardService.searchWizardById = jest.fn().mockResolvedValue({
        ...mockWizard,
        spells: [mockSpell],
        mana: 50,
      });

      await expect(WizardService.castSpell(mockCharacter.id, 'target-id', mockSpell.id)).rejects.toThrow('Not enough mana to cast the spell');
    });
  });

  describe('restoreMana', () => {
    it('should restore mana using a potion', async () => {
        // Ensure the mock wizard has mana less than maxMana
        const mockWizardWithPotions = {
            ...mockWizard,
            potions: [mockManaPotion]
        };

        WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizardWithPotions);

        const updatedWizard = await WizardService.restoreMana(mockWizardWithPotions.id);

        // Mana should be capped at maxMana
        expect(updatedWizard.mana).toBe(mockWizard.maxMana); // It should be 1500, as 1000 + 500 > maxMana
        expect(updatedWizard.potions).not.toContain(mockManaPotion);
    });

    it('should throw an error if no mana potions available', async () => {
        const mockWizardWithoutPotions = {
            ...mockWizard,
            potions: [],
        };

        WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizardWithoutPotions);

        await expect(WizardService.restoreMana(mockWizardWithoutPotions.id))
            .rejects.toThrow('No mana potions available');
    });

    it('should throw an error if mana is already at max', async () => {
        const mockWizardFullMana = {
          ...mockWizard,
          mana: mockWizard.maxMana,
          potions: [mockManaPotion],
        };
    
        WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizardFullMana);
    
        await expect(WizardService.restoreMana(mockWizardFullMana.id))
          .rejects.toThrow('Your Mana is full! Keep combat wizard');
      });
});

});