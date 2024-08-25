const WizardService = require('../services/WizardService');
const CharacterService = require('../services/CharacterService');
const SpellService = require('../services/SpellService');
const ClassService = require('../services/ClassService');
const pool = require('../config/db');
const Wizard = require('../models/Wizard');
const Spell = require('../models/Spell');

jest.mock('../config/db');
jest.mock('../services/CharacterService');
jest.mock('../services/SpellService');
jest.mock('../services/ClassService');

describe('WizardService', () => {
    describe('createWizard', () => {
        it('should create a new wizard', async () => {
            const mockCharacter = { id: 1, name: 'Gandalf', race: 'Human', classId: 1, gear: [], potions: [], weapons: [], hp: 500, maxHp: 500, ac: 10 };
            const mockWizardClass = { id: 1, name: 'Wizard' };
            const mockWizard = new Wizard(1, 'Gandalf', 'Human', 1, [], [], [], 500, 500, 10, 1000, 1000);

            CharacterService.createCharacter.mockResolvedValue(mockCharacter);
            ClassService.searchClassById.mockResolvedValue(mockWizardClass);
            pool.query.mockResolvedValue({ insertId: 1 });

            const result = await WizardService.createWizard({ name: 'Gandalf', race: 'Human', classId: 1, hp: 500, maxHp: 500, ac: 10 });

            expect(result).toEqual(mockWizard);
            expect(pool.query).toHaveBeenCalledWith('INSERT INTO wizards (character_id, mana, maxMana) VALUES (?, ?, ?)', [1, 1000, 1000]);
        });

        it('should throw an error for an invalid class ID', async () => {
            ClassService.searchClassById.mockResolvedValue({ name: 'Warrior' });

            await expect(WizardService.createWizard({ name: 'Gandalf', race: 'Human', classId: 1, hp: 500, maxHp: 500, ac: 10 }))
                .rejects
                .toThrow('Invalid class ID for Wizard');
        });
    });

    describe('searchWizardById', () => {
        it('should return a wizard by ID', async () => {
            const mockCharacter = { id: 1, name: 'Gandalf', race: 'Human', classId: 1, gear: [], potions: [], weapons: [], hp: 500, maxHp: 500, ac: 10 };
            const mockWizard = { mana: 1000, maxMana: 1000 };
            const mockSpell = new Spell(1, 'Fireball', 'A powerful fire spell', 50, 100, 3);

            CharacterService.searchCharacterById.mockResolvedValue(mockCharacter);
            ClassService.searchClassById.mockResolvedValue({ name: 'Wizard' });
            pool.query.mockResolvedValueOnce([{ character_id: 1, mana: 1000, maxMana: 1000 }]);
            pool.query.mockResolvedValueOnce([{ id: 1, name: 'Fireball', description: 'A powerful fire spell', manaCost: 50, damage: 100, duration: 3 }]);

            const result = await WizardService.searchWizardById(1);

            expect(result).toEqual({
                ...mockCharacter,
                mana: mockWizard.mana,
                maxMana: mockWizard.maxMana,
                spells: [mockSpell]
            });
        });

        it('should return null if wizard does not exist', async () => {
            CharacterService.searchCharacterById.mockResolvedValue(null);

            const result = await WizardService.searchWizardById(1);

            expect(result).toBeNull();
        });
    });

    describe('updateWizard', () => {
        it('should update an existing wizard', async () => {
            const mockCharacter = { id: 1, name: 'Gandalf', race: 'Human', classId: 1, gear: [], potions: [], weapons: [], hp: 500, maxHp: 500, ac: 10 };
            const mockWizard = { mana: 800, maxMana: 1000 };
            const mockSpell = new Spell(1, 'Fireball', 'A powerful fire spell', 50, 100, 3);

            CharacterService.updateCharacter.mockResolvedValue(mockCharacter);
            ClassService.searchClassById.mockResolvedValue({ name: 'Wizard' });
            pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Update wizard
            pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // Delete old spells
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Insert new spells

            const result = await WizardService.updateWizard(1, {
                name: 'Gandalf the Grey',
                race: 'Human',
                classId: 1,
                gear: [],
                potions: [],
                weapons: [],
                spells: [mockSpell],
                hp: 500,
                maxHp: 500,
                ac: 10,
                mana: 800,
                maxMana: 1000
            });

            expect(result).toEqual({
                ...mockCharacter,
                mana: 800,
                maxMana: 1000,
                spells: [mockSpell]
            });
        });

        it('should throw an error for an invalid class ID', async () => {
            ClassService.searchClassById.mockResolvedValue({ name: 'Warrior' });

            await expect(WizardService.updateWizard(1, { name: 'Gandalf', classId: 2 }))
                .rejects
                .toThrow('Invalid class ID for Wizard');
        });
    });

    describe('deleteWizard', () => {
        it('should delete an existing wizard', async () => {
            CharacterService.deleteCharacter.mockResolvedValue(true);
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Delete wizard spells
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Delete wizard

            const result = await WizardService.deleteWizard(1);

            expect(result).toBe(true);
        });

        it('should throw an error if deletion fails', async () => {
            pool.query.mockRejectedValue(new Error('Deletion failed'));

            await expect(WizardService.deleteWizard(1))
                .rejects
                .toThrow('Deletion failed');
        });
    });

    describe('addSpell', () => {
        it('should add a spell to a wizard', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', spells: [] };
            const mockSpell = new Spell(1, 'Fireball', 'A powerful fire spell', 50, 100, 3);

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Insert spell

            const result = await WizardService.addSpell(1, 1);

            expect(result.spells).toContain(mockSpell);
        });

        it('should throw an error if the wizard or spell does not exist', async () => {
            WizardService.searchWizardById.mockResolvedValue(null);
            SpellService.searchSpellById.mockResolvedValue(null);

            await expect(WizardService.addSpell(1, 1))
                .rejects
                .toThrow('Wizard not found');

            WizardService.searchWizardById.mockResolvedValue({});
            SpellService.searchSpellById.mockResolvedValue(null);

            await expect(WizardService.addSpell(1, 1))
                .rejects
                .toThrow('Spell not found');
        });

        it('should throw an error if the spell is already added', async () => {
            const mockWizard = { id: 1, spells: [{ id: 1 }] };
            const mockSpell = new Spell(1, 'Fireball', 'A powerful fire spell', 50, 100, 3);

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);
            pool.query.mockResolvedValue([{ id: 1 }]); // Spell already exists

            await expect(WizardService.addSpell(1, 1))
                .rejects
                .toThrow('Spell already added to this character');
        });
    });

    describe('castSpell', () => {
        it('should cast a spell successfully', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, spells: [{ id: 1, manaCost: 50, damage: 100 }] };
            const mockSpell = new Spell(1, 'Fireball', 'A powerful fire spell', 50, 100, 3);
            const mockTarget = { id: 2, name: 'Orc', hp: 200, maxHp: 200 };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);
            CharacterService.searchCharacterById.mockResolvedValue(mockTarget);
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Update target HP
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Update wizard mana

            const result = await WizardService.castSpell(1, 2, 1);

            expect(result.message).toBe('Gandalf cast Fireball on Orc, dealing 300 damage. Orc has been defeated.');
        });

        it('should throw an error if the wizard does not have enough mana', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 10, spells: [{ id: 1, manaCost: 50, damage: 100 }] };
            const mockSpell = new Spell(1, 'Fireball', 'A powerful fire spell', 50, 100, 3);

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);

            await expect(WizardService.castSpell(1, 2, 1))
                .rejects
                .toThrow('Not enough mana to cast the spell');
        });

        it('should throw an error if the spell is not found', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, spells: [] };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(null);

            await expect(WizardService.castSpell(1, 2, 1))
                .rejects
                .toThrow('Spell not found');
        });
    });

    describe('restoreMana', () => {
        it('should restore mana for a wizard', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 500, maxMana: 1000, potions: [{ id: 1, effects: { manaRestore: 300 } }] };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Update wizard mana
            pool.query.mockResolvedValue({ affectedRows: 1 }); // Update character potions

            const result = await WizardService.restoreMana(1);

            expect(result.mana).toBe(800);
            expect(result.potions).toEqual([]);
        });

        it('should throw an error if no mana potion is available', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 500, maxMana: 1000, potions: [] };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);

            await expect(WizardService.restoreMana(1))
                .rejects
                .toThrow('No mana potions available');
        });

        it('should throw an error if mana is already full', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, maxMana: 1000, potions: [{ id: 1, effects: { manaRestore: 300 } }] };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);

            await expect(WizardService.restoreMana(1))
                .rejects
                .toThrow('Your Mana is full! Keep combat wizard');
        });
    });
});
