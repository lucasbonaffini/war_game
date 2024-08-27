const WizardService = require('../../services/WizardService');
const CharacterService = require('../../services/CharacterService');
const SpellService = require('../../services/SpellService');
const ClassService = require('../../services/ClassService');
const pool = require('../../config/db');

// Mock de las dependencias externas
jest.mock('../../services/CharacterService');
jest.mock('../../services/SpellService');
jest.mock('../../services/ClassService');
jest.mock('../../config/db', () => ({
    getConnection: jest.fn(() => ({
        query: jest.fn(),
        release: jest.fn(),
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
    })),
}));

describe('WizardService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createWizard', () => {
        it('should create a wizard successfully', async () => {
            // Configuración del mock para la clase Wizard
            ClassService.searchClassById.mockResolvedValue({ id: 1, name: 'Wizard' });
            CharacterService.createCharacter.mockResolvedValue({ id: 1, name: 'Gandalf', race: 'Human', classId: 1 });

            const result = await WizardService.createWizard({
                name: 'Gandalf',
                race: 'Human',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 10,
                mana: 1000,
                maxMana: 1000,
            });

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Gandalf',
                race: 'Human',
                classId: 1,
                mana: 1000,
                maxMana: 1000,
            }));
        });

        it('should throw an error if class is not wizard', async () => {
            ClassService.searchClassById.mockResolvedValue({ id: 2, name: 'Warrior' });

            await expect(WizardService.createWizard({
                name: 'Gandalf',
                race: 'Human',
                classId: 2,
                hp: 100,
                maxHp: 100,
                ac: 10,
            })).rejects.toThrow('Invalid class ID for Wizard');
        });
    });

    describe('searchWizardById', () => {
        it('should return a wizard by ID', async () => {
            CharacterService.searchCharacterById.mockResolvedValue({ id: 1, name: 'Gandalf', race: 'Human', classId: 1 });
            ClassService.searchClassById.mockResolvedValue({ id: 1, name: 'Wizard' });
            pool.query.mockResolvedValueOnce([[{ character_id: 1, mana: 1000, maxMana: 1000 }]]);
            pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Fireball', description: 'A fiery spell', manaCost: 50, damage: 100, duration: 3 }]]);

            const result = await WizardService.searchWizardById(1);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Gandalf',
                mana: 1000,
                maxMana: 1000,
                spells: expect.arrayContaining([expect.objectContaining({ name: 'Fireball' })]),
            }));
        });

        it('should return null if wizard not found', async () => {
            CharacterService.searchCharacterById.mockResolvedValue(null);
            const result = await WizardService.searchWizardById(999);
            expect(result).toBeNull();
        });
    });

    describe('updateWizard', () => {
        it('should update a wizard successfully', async () => {
            CharacterService.updateCharacter.mockResolvedValue({ id: 1, name: 'Gandalf', race: 'Human', classId: 1 });
            ClassService.searchClassById.mockResolvedValue({ id: 1, name: 'Wizard' });
            pool.getConnection().query.mockResolvedValue();

            const result = await WizardService.updateWizard(1, {
                name: 'Gandalf the White',
                race: 'Human',
                classId: 1,
                hp: 120,
                maxHp: 120,
                ac: 15,
                mana: 1500,
                maxMana: 1500,
                spells: [{ id: 1 }],
            });

            expect(result).toEqual(expect.objectContaining({
                name: 'Gandalf the White',
                mana: 1500,
                maxMana: 1500,
            }));
        });

        it('should throw an error if wizard class is invalid', async () => {
            ClassService.searchClassById.mockResolvedValue({ id: 2, name: 'Warrior' });

            await expect(WizardService.updateWizard(1, {
                name: 'Gandalf the White',
                race: 'Human',
                classId: 2,
                hp: 120,
                maxHp: 120,
                ac: 15,
                mana: 1500,
                maxMana: 1500,
                spells: [{ id: 1 }],
            })).rejects.toThrow('Invalid class ID for Wizard');
        });
    });

    describe('deleteWizard', () => {
        it('should delete a wizard successfully', async () => {
            pool.getConnection().query.mockResolvedValue();
            CharacterService.deleteCharacter.mockResolvedValue();

            const result = await WizardService.deleteWizard(1);

            expect(result).toBe(true);
        });

        it('should throw an error if deletion fails', async () => {
            pool.getConnection().query.mockRejectedValue(new Error('Deletion failed'));

            await expect(WizardService.deleteWizard(1)).rejects.toThrow('Error deleting wizard');
        });
    });

    describe('getAllWizards', () => {
        it('should return all wizards', async () => {
            CharacterService.getAllCharacters.mockResolvedValue([
                { id: 1, name: 'Gandalf', race: 'Human', classId: 1 },
                { id: 2, name: 'Saruman', race: 'Human', classId: 1 },
            ]);
            pool.getConnection().query.mockResolvedValueOnce([[{ character_id: 1, mana: 1000, maxMana: 1000 }], [{ character_id: 2, mana: 1200, maxMana: 1200 }]]);
            pool.getConnection().query.mockResolvedValueOnce([
                { character_id: 1, id: 1, name: 'Fireball', description: 'A fiery spell', manaCost: 50, damage: 100, duration: 3 },
                { character_id: 2, id: 2, name: 'Lightning', description: 'A shocking spell', manaCost: 60, damage: 120, duration: 2 },
            ]);

            const result = await WizardService.getAllWizards();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(expect.objectContaining({ name: 'Gandalf' }));
            expect(result[1]).toEqual(expect.objectContaining({ name: 'Saruman' }));
        });
    });

    describe('addSpell', () => {
        it('should add a spell to a wizard', async () => {
            const wizard = {
                id: 1,
                name: 'Gandalf',
                spells: [],
                mana: 1000,
                maxMana: 1000,
            };
            WizardService.searchWizardById.mockResolvedValue(wizard);
            SpellService.searchSpellById.mockResolvedValue({ id: 1, name: 'Fireball' });
            pool.query.mockResolvedValue([[]]);

            const result = await WizardService.addSpell(1, 1);

            expect(result.spells).toHaveLength(1);
            expect(result.spells[0]).toEqual(expect.objectContaining({ name: 'Fireball' }));
        });

        it('should throw an error if spell is already added', async () => {
            const wizard = {
                id: 1,
                name: 'Gandalf',
                spells: [{ id: 1, name: 'Fireball' }],
                mana: 1000,
                maxMana: 1000,
            };
            WizardService.searchWizardById.mockResolvedValue(wizard);
            SpellService.searchSpellById.mockResolvedValue({ id: 1, name: 'Fireball' });
            pool.query.mockResolvedValue([[{ character_id: 1, spell_id: 1 }]]);

            await expect(WizardService.addSpell(1, 1)).rejects.toThrow('Spell already added to this character');
        });
    });

    describe('castSpell', () => {
        it('should cast a spell and reduce target HP', async () => {
            const wizard = {
                id: 1,
                name: 'Gandalf',
                mana: 1000,
                maxMana: 1000,
                spells: [{ id: 1, name: 'Fireball', manaCost: 50, damage: 100, duration: 3 }],
            };
            const target = { id: 2, name: 'Orc', hp: 300 };
            WizardService.searchWizardById.mockResolvedValue(wizard);
            SpellService.searchSpellById.mockResolvedValue(wizard.spells[0]);
            CharacterService.searchCharacterById.mockResolvedValue(target);
            CharacterService.updateCharacter.mockResolvedValue({ ...target, hp: 200 });

            const result = await WizardService.castSpell(1, 1, 2);

            expect(result.target.hp).toBe(200);
            expect(result.wizard.mana).toBe(950);
        });

        it('should throw an error if wizard lacks sufficient mana', async () => {
            const wizard = {
                id: 1,
                name: 'Gandalf',
                mana: 40,
                maxMana: 1000,
                spells: [{ id: 1, name: 'Fireball', manaCost: 50, damage: 100, duration: 3 }],
            };
            WizardService.searchWizardById.mockResolvedValue(wizard);

            await expect(WizardService.castSpell(1, 1, 2)).rejects.toThrow('Not enough mana to cast this spell');
        });
    });
});

