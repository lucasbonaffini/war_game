const WizardService = require('../../services/WizardService');
const CharacterService = require('../../services/CharacterService');
const ClassService = require('../../services/ClassService');
const SpellService = require('../../services/SpellService');
const pool = require('../../config/db');

// Mocking the database connection
jest.mock('../../config/db');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('WizardService', () => {
    describe('createWizard', () => {
      it('should create a new wizard', async () => {
        const mockClass = { id: 1, name: 'Wizard' };
        const mockCharacter = { id: 1, name: 'Gandalf', classId: 1 };
  
        // Mock the database queries
        pool.query.mockResolvedValueOnce({ insertId: 1 }); // Mock the insert wizard query
        ClassService.searchClassById = jest.fn().mockResolvedValue(mockClass);
        CharacterService.createCharacter = jest.fn().mockResolvedValue(mockCharacter);
  
        const wizard = await WizardService.createWizard('Gandalf', 1);
  
        expect(wizard).toEqual(expect.objectContaining({
          id: 1,
          name: 'Gandalf',
          classId: 1,
        }));
      });
  
      it('should throw an error for an invalid class ID', async () => {
        ClassService.searchClassById = jest.fn().mockResolvedValue(null);
  
        await expect(WizardService.createWizard('Gandalf', 999))
          .rejects
          .toThrow('Invalid class ID for Wizard');
      });
    });

    describe('searchWizardById', () => {
        it('should return a wizard by ID', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', classId: 1 };
          const mockSpells = [{ id: 1, name: 'Fireball', description: 'A powerful fire spell' }];
      
          pool.query.mockResolvedValueOnce([mockWizard]); // Mock wizard query
          pool.query.mockResolvedValueOnce(mockSpells); // Mock spells query
          ClassService.searchClassById = jest.fn().mockResolvedValue({ name: 'Wizard' });
      
          const wizard = await WizardService.searchWizardById(1);
      
          expect(wizard).toEqual(expect.objectContaining({
            id: 1,
            name: 'Gandalf',
            spells: expect.arrayContaining([
              expect.objectContaining({ name: 'Fireball' })
            ])
          }));
        });
      
        it('should return null if wizard does not exist', async () => {
          pool.query.mockResolvedValueOnce([]);
          ClassService.searchClassById = jest.fn().mockResolvedValue({ name: 'Wizard' });
      
          const wizard = await WizardService.searchWizardById(999);
      
          expect(wizard).toBeNull();
        });
      });

      describe('updateWizard', () => {
        it('should update an existing wizard', async () => {
          pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Mock update query
          const updatedWizard = { id: 1, name: 'Gandalf the Grey' };
      
          const result = await WizardService.updateWizard(1, { name: 'Gandalf the Grey' });
      
          expect(result).toEqual(expect.objectContaining(updatedWizard));
        });
      
        it('should throw an error if update fails', async () => {
          pool.query.mockResolvedValueOnce({ affectedRows: 0 });
      
          await expect(WizardService.updateWizard(1, { name: 'Gandalf the Grey' }))
            .rejects
            .toThrow('Update failed');
        });
      });
      
      describe('deleteWizard', () => {
        it('should delete an existing wizard', async () => {
          pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Mock delete query
      
          await expect(WizardService.deleteWizard(1))
            .resolves
            .toBeUndefined();
        });
      
        it('should throw an error if deletion fails', async () => {
          pool.query.mockResolvedValueOnce({ affectedRows: 0 });
      
          await expect(WizardService.deleteWizard(1))
            .rejects
            .toThrow('Deletion failed');
        });
      });

      describe('addSpell', () => {
        it('should add a spell to a wizard', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', spells: [] };
          const mockSpell = { id: 1, name: 'Fireball' };
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          SpellService.searchSpellById = jest.fn().mockResolvedValue(mockSpell);
          pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Mock add spell query
      
          await WizardService.addSpell(1, 1);
      
          expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO wizard_spells (wizard_id, spell_id) VALUES (?, ?)',
            [1, 1]
          );
        });
      
        it('should throw an error if the wizard or spell does not exist', async () => {
          WizardService.searchWizardById = jest.fn().mockResolvedValue(null);
          SpellService.searchSpellById = jest.fn().mockResolvedValue(null);
      
          await expect(WizardService.addSpell(1, 1))
            .rejects
            .toThrow('Wizard or Spell does not exist');
        });
      
        it('should throw an error if the spell is already added', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', spells: [{ id: 1 }] };
          const mockSpell = { id: 1, name: 'Fireball' };
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          SpellService.searchSpellById = jest.fn().mockResolvedValue(mockSpell);
          pool.query.mockResolvedValueOnce([{ id: 1 }]); // Mock spell already exists
      
          await expect(WizardService.addSpell(1, 1))
            .rejects
            .toThrow('Spell already added to wizard');
        });
      });

      describe('castSpell', () => {
        it('should cast a spell successfully', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, spells: [{ id: 1, damage: 50 }] };
          const mockSpell = { id: 1, name: 'Fireball', damage: 50 };
          const mockTarget = { id: 2, name: 'Orc', hp: 200 };
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          SpellService.searchSpellById = jest.fn().mockResolvedValue(mockSpell);
          CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockTarget);
          pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Mock update target HP
      
          await WizardService.castSpell(1, 2, 1);
      
          expect(pool.query).toHaveBeenCalledWith(
            'UPDATE characters SET hp = hp - ? WHERE id = ?',
            [50, 2]
          );
        });
      
        it('should throw an error if the wizard does not have enough mana', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', mana: 10, spells: [{ id: 1, manaCost: 50 }] };
          const mockSpell = { id: 1, name: 'Fireball', manaCost: 50 };
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          SpellService.searchSpellById = jest.fn().mockResolvedValue(mockSpell);
      
          await expect(WizardService.castSpell(1, 2, 1))
            .rejects
            .toThrow('Not enough mana');
        });
      
        it('should throw an error if the spell is not found', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, spells: [] };
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          SpellService.searchSpellById = jest.fn().mockResolvedValue(null);
      
          await expect(WizardService.castSpell(1, 2, 999))
            .rejects
            .toThrow('Spell not found');
        });
      });

      describe('restoreMana', () => {
        it('should restore mana for a wizard', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', mana: 100, maxMana: 1000 };
          const restoredMana = 200;
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Mock update mana query
      
          await WizardService.restoreMana(1, restoredMana);
      
          expect(pool.query).toHaveBeenCalledWith(
            'UPDATE wizards SET mana = LEAST(mana + ?, maxMana) WHERE id = ?',
            [restoredMana, 1]
          );
        });
      
        it('should not exceed maxMana when restoring mana', async () => {
          const mockWizard = { id: 1, name: 'Gandalf', mana: 900, maxMana: 1000 };
          const restoredMana = 200;
      
          WizardService.searchWizardById = jest.fn().mockResolvedValue(mockWizard);
          pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Mock update mana query
      
          await WizardService.restoreMana(1, restoredMana);
      
          expect(pool.query).toHaveBeenCalledWith(
            'UPDATE wizards SET mana = LEAST(mana + ?, maxMana) WHERE id = ?',
            [restoredMana, 1]
          );
        });
      
        it('should throw an error if wizard is not found', async () => {
          WizardService.searchWizardById = jest.fn().mockResolvedValue(null);
      
          await expect(WizardService.restoreMana(999, 200))
            .rejects
            .toThrow('Wizard not found');
        });
      });           
  });
  
