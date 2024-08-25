// src/__tests__/services/WizardService.test.js

const WizardService = require('../../services/WizardService');
const CharacterService = require('../../services/CharacterService');
const SpellService = require('../../services/SpellService');
const ClassService = require('../../services/ClassService');
const { pool } = require('../../config/db');

jest.mock('../../services/CharacterService');
jest.mock('../../services/SpellService');
jest.mock('../../services/ClassService');
jest.mock('../../config/db');

describe('WizardService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createWizard', () => {
        it('should create a wizard with valid classId', async () => {
            const mockWizard = {
                id: 1,
                name: 'Gandalf',
                race: 'Maia',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 10,
                mana: 1000,
                maxMana: 1000,
                gear: [],
                potions: [],
                weapons: [],
            };

            CharacterService.createCharacter.mockResolvedValue(mockWizard);
            pool.query.mockResolvedValue({ insertId: 1 });
            ClassService.searchClassById.mockResolvedValue({ id: 1, name: 'Wizard' });

            const wizard = await WizardService.createWizard(mockWizard);

            expect(CharacterService.createCharacter).toHaveBeenCalledWith(mockWizard);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO wizards (character_id, mana, maxMana) VALUES (?, ?, ?)',
                [1, 1000, 1000]
            );
            expect(wizard).toEqual(expect.objectContaining({ name: 'Gandalf', mana: 1000, maxMana: 1000 }));
        });

        it('should throw an error if the classId does not belong to a wizard', async () => {
            const mockWizard = {
                name: 'Gandalf',
                race: 'Maia',
                classId: 2,
                hp: 100,
                maxHp: 100,
                ac: 10
            };

            ClassService.searchClassById.mockResolvedValue({ id: 2, name: 'Warrior' });

            await expect(WizardService.createWizard(mockWizard))
                .rejects
                .toThrow('Invalid class ID for Wizard');
        });

        it('should throw an error if character creation fails', async () => {
            const mockWizard = {
                name: 'Gandalf',
                race: 'Maia',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 10
            };

            ClassService.searchClassById.mockResolvedValue({ id: 1, name: 'Wizard' });
            CharacterService.createCharacter.mockRejectedValue(new Error('Error creating character'));

            await expect(WizardService.createWizard(mockWizard))
                .rejects
                .toThrow('Error creating character');
        });
    });

    describe('searchWizardById', () => {
        it('should return a wizard by ID', async () => {
            const mockCharacter = { id: 1, name: 'Gandalf', race: 'Maia', classId: 1, hp: 100, maxHp: 100, ac: 10, gear: [], potions: [], weapons: [] };
            const mockWizardData = [{ character_id: 1, mana: 1000, maxMana: 1000 }];
            const mockSpellData = [{ id: 1, name: 'Fireball', description: 'A powerful fire spell', manaCost: 50, damage: 100, duration: 1 }];

            CharacterService.searchCharacterById.mockResolvedValue(mockCharacter);
            pool.query.mockResolvedValueOnce(mockWizardData);
            pool.query.mockResolvedValueOnce(mockSpellData);

            const wizard = await WizardService.searchWizardById(1);

            expect(wizard).toEqual(expect.objectContaining({ name: 'Gandalf', mana: 1000, maxMana: 1000 }));
            expect(wizard.spells.length).toBe(1);
            expect(wizard.spells[0]).toEqual(expect.objectContaining({ name: 'Fireball' }));
        });

        it('should return null if wizard not found', async () => {
            CharacterService.searchCharacterById.mockResolvedValue(null);

            const wizard = await WizardService.searchWizardById(1);

            expect(wizard).toBeNull();
        });
    });

    describe('updateWizard', () => {
        it('should update the wizard details', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', race: 'Maia', classId: 1, hp: 100, maxHp: 100, ac: 10, mana: 500, maxMana: 1000, spells: [] };
            const mockUpdatedWizard = { ...mockWizard, name: 'Gandalf the White', mana: 800 };

            pool.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                commit: jest.fn(),
                query: jest.fn(),
                release: jest.fn(),
                rollback: jest.fn()
            });

            CharacterService.updateCharacter.mockResolvedValue(mockUpdatedWizard);
            ClassService.searchClassById.mockResolvedValue({ id: 1, name: 'Wizard' });

            const result = await WizardService.updateWizard(1, mockUpdatedWizard);

            expect(result).toEqual(expect.objectContaining({ name: 'Gandalf the White', mana: 800 }));
        });

        it('should rollback the transaction if an error occurs', async () => {
            const mockConnection = {
                beginTransaction: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn(),
                query: jest.fn()
            };

            pool.getConnection.mockResolvedValue(mockConnection);
            CharacterService.updateCharacter.mockRejectedValue(new Error('Failed to update character'));

            await expect(WizardService.updateWizard(1, {})).rejects.toThrow('Failed to update character');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('deleteWizard', () => {
        it('should delete the wizard and related data', async () => {
            const mockConnection = {
                beginTransaction: jest.fn(),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn(),
                query: jest.fn()
            };

            pool.getConnection.mockResolvedValue(mockConnection);

            pool.query.mockResolvedValue({ affectedRows: 1 });

            const result = await WizardService.deleteWizard(1);

            expect(result).toBe(true);
            expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM wizard_spells WHERE character_id = ?', [1]);
            expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM wizards WHERE character_id = ?', [1]);
            expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', [1]);
        });

        it('should rollback the transaction if an error occurs', async () => {
            const mockConnection = {
                beginTransaction: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn(),
                query: jest.fn()
            };

            pool.getConnection.mockResolvedValue(mockConnection);
            mockConnection.query.mockRejectedValueOnce(new Error('Deletion failed'));

            await expect(WizardService.deleteWizard(1)).rejects.toThrow('Deletion failed');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('addSpell', () => {
        it('should add a spell to the wizard', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, maxMana: 1000, spells: [] };
            const mockSpell = { id: 1, name: 'Fireball', description: 'A powerful fire spell', manaCost: 50, damage: 100 };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);

            pool.query.mockResolvedValue({ affectedRows: 1 });

            const result = await WizardService.addSpell(1, 1);

            expect(result.spells).toContainEqual(mockSpell);
        });

        it('should throw an error if the spell is already added', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, maxMana: 1000, spells: [{ id: 1, name: 'Fireball' }] };
            const mockSpell = { id: 1, name: 'Fireball', description: 'A powerful fire spell', manaCost: 50, damage: 100 };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);

            await expect(WizardService.addSpell(1, 1)).rejects.toThrow('Spell already added to this wizard');
        });
    });

    describe('castSpell', () => {
        it('should cast a spell on a target', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 1000, maxMana: 1000, spells: [{ id: 1, name: 'Fireball', manaCost: 50, damage: 100 }] };
            const mockSpell = { id: 1, name: 'Fireball', description: 'A powerful fire spell', manaCost: 50, damage: 100, duration: 1 };
            const mockTarget = { id: 2, name: 'Orc', hp: 200, maxHp: 200 };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);
            CharacterService.searchCharacterById.mockResolvedValue(mockTarget);

            pool.query.mockResolvedValue({ affectedRows: 1 });

            const result = await WizardService.castSpell(1, 1, 2);

            expect(result.target.hp).toBe(mockTarget.hp - mockSpell.damage);
            expect(result.spell).toEqual(mockSpell);
        });

        it('should throw an error if the wizard does not have enough mana', async () => {
            const mockWizard = { id: 1, name: 'Gandalf', mana: 30, maxMana: 1000, spells: [{ id: 1, name: 'Fireball', manaCost: 50, damage: 100 }] };
            const mockSpell = { id: 1, name: 'Fireball', description: 'A powerful fire spell', manaCost: 50, damage: 100 };
            const mockTarget = { id: 2, name: 'Orc', hp: 200, maxHp: 200 };

            WizardService.searchWizardById.mockResolvedValue(mockWizard);
            SpellService.searchSpellById.mockResolvedValue(mockSpell);
            CharacterService.searchCharacterById.mockResolvedValue(mockTarget);

            await expect(WizardService.castSpell(1, 1, 2)).rejects.toThrow('Not enough mana to cast this spell');
        });
    });
});
