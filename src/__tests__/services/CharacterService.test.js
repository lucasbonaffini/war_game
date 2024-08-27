const CharacterService = require('../../services/CharacterService');
const pool = require('../../config/db');
const WeaponService = require('../../services/WeaponService');
const GearService = require('../../services/GearService');
const PotionService = require('../../services/PotionService');
const ClassService = require('../../services/ClassService');
const Character = require('../../models/Character');
const Weapon = require('../../models/Weapon');
const Gear = require('../../models/Gear');
const Potion = require('../../models/Potion');

jest.mock('../../config/db');
jest.mock('../../services/WeaponService');
jest.mock('../../services/GearService');
jest.mock('../../services/PotionService');
jest.mock('../../services/ClassService');

describe('CharacterService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCharacter', () => {
        it('should create a character successfully', async () => {
            const characterData = { name: 'Aragorn', race: 'Human', classId: 1, hp: 100, maxHp: 100, ac: 50 };
            const mockResult = { insertId: 1 };

            pool.query.mockResolvedValue([mockResult]);

            const character = await CharacterService.createCharacter(characterData);

            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [character.id, character.name, character.race, character.classId, character.hp, character.maxHp, character.ac]
            );
            expect(character).toBeInstanceOf(Character);
            expect(character.name).toBe('Aragorn');
        });

        it('should throw an error if creation fails', async () => {
            const characterData = { name: 'Aragorn', race: 'Human', classId: 1, hp: 100, maxHp: 100, ac: 50 };
            pool.query.mockRejectedValue(new Error('Creation failed'));

            await expect(CharacterService.createCharacter(characterData)).rejects.toThrow('Creation failed');
        });
    });

    describe('searchCharacterById', () => {
        it('should return the character with its gear, potions, and weapons', async () => {
            const mockCharacterData = { id: 1, name: 'Aragorn', race: 'Human', class_id: 1, hp: 100, maxHp: 100, ac: 50 };
            const mockPotionData = [{ id: 1, name: 'Healing Potion', effects: '{"hpRestore": 50}', utility: 'Healing' }];
            const mockGearData = [{ id: 1, name: 'Iron Chestplate', category: 'Chestplate', armour: 300 }];
            const mockWeaponData = [{ id: 1, name: 'Sword', category: 'Melee', damage: 50 }];

            pool.query.mockResolvedValueOnce([[mockCharacterData]]);
            pool.query.mockResolvedValueOnce([mockPotionData]);
            pool.query.mockResolvedValueOnce([mockGearData]);
            pool.query.mockResolvedValueOnce([mockWeaponData]);

            const character = await CharacterService.searchCharacterById(1);

            expect(character).toBeInstanceOf(Character);
            expect(character.name).toBe('Aragorn');
            expect(character.potions).toHaveLength(1);
            expect(character.gear).toHaveLength(1);
            expect(character.weapons).toHaveLength(1);
        });

        it('should return null if character is not found', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const character = await CharacterService.searchCharacterById(1);

            expect(character).toBeNull();
        });
    });

    describe('updateCharacter', () => {
        it('should update the character successfully', async () => {
            const mockCharacterData = {
                name: 'Aragorn',
                race: 'Human',
                classId: 1,
                gear: [{ id: 1 }],
                potions: [{ id: 1 }],
                weapons: [{ id: 1 }],
                hp: 100,
                maxHp: 100,
                ac: 50
            };

            pool.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                query: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            });

            const result = await CharacterService.updateCharacter(1, mockCharacterData);

            expect(result).toBe(true);
        });

        it('should throw an error if update fails', async () => {
            pool.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                query: jest.fn().mockRejectedValue(new Error('Update failed')),
                rollback: jest.fn(),
                release: jest.fn()
            });

            await expect(CharacterService.updateCharacter(1, {})).rejects.toThrow('Update failed');
        });
    });

    describe('deleteCharacter', () => {
        it('should delete the character successfully', async () => {
            pool.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                query: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            });

            const result = await CharacterService.deleteCharacter(1);

            expect(result).toBe(true);
        });

        it('should return false if character is not found', async () => {
            pool.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                query: jest.fn().mockResolvedValue([{ affectedRows: 0 }]),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            });

            const result = await CharacterService.deleteCharacter(1);

            expect(result).toBe(false);
        });

        it('should throw an error if deletion fails', async () => {
            pool.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                query: jest.fn().mockRejectedValue(new Error('Deletion failed')),
                rollback: jest.fn(),
                release: jest.fn()
            });

            await expect(CharacterService.deleteCharacter(1)).rejects.toThrow('Deletion failed');
        });
    });

    describe('getAllCharacters', () => {
        it('should return all characters with their gear, potions, and weapons', async () => {
            const mockCharacterData = [{ id: 1, name: 'Aragorn', race: 'Human', class_id: 1, hp: 100, maxHp: 100, ac: 50 }];
            const mockPotionData = [{ character_id: 1, id: 1, name: 'Healing Potion', effects: '{"hpRestore": 50}', utility: 'Healing' }];
            const mockGearData = [{ character_id: 1, id: 1, name: 'Iron Chestplate', category: 'Chestplate', armour: 300 }];
            const mockWeaponData = [{ character_id: 1, id: 1, name: 'Sword', category: 'Melee', damage: 50 }];

            pool.query.mockResolvedValueOnce([mockCharacterData]);
            pool.query.mockResolvedValueOnce([mockGearData]);
            pool.query.mockResolvedValueOnce([mockPotionData]);
            pool.query.mockResolvedValueOnce([mockWeaponData]);

            const characters = await CharacterService.getAllCharacters();

            expect(characters).toHaveLength(1);
            expect(characters[0].name).toBe('Aragorn');
            expect(characters[0].gear).toHaveLength(1);
            expect(characters[0].potions).toHaveLength(1);
            expect(characters[0].weapons).toHaveLength(1);
        });

        it('should throw an error if fetching fails', async () => {
            pool.query.mockRejectedValue(new Error('Fetching failed'));

            await expect(CharacterService.getAllCharacters()).rejects.toThrow('Fetching failed');
        });
    });

    describe('addWeapon', () => {
        it('should add a weapon to the character', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 100, 100, 50);
            const mockWeapon = new Weapon(1, 'Sword', 'Melee', 50);

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            WeaponService.searchWeaponById = jest.fn().mockResolvedValue(mockWeapon);

            pool.query.mockResolvedValue([[]]); // Simulate no existing weapon entry
            pool.query.mockResolvedValueOnce(); // Simulate successful insert

            const updatedCharacter = await CharacterService.addWeapon(1, 1);

            expect(updatedCharacter.weapons).toHaveLength(1);
            expect(updatedCharacter.weapons[0].name).toBe('Sword');
        });

        it('should throw an error if the weapon already exists', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 100, 100, 50);
            const mockWeapon = new Weapon(1, 'Sword', 'Melee', 50);

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            WeaponService.searchWeaponById = jest.fn().mockResolvedValue(mockWeapon);

            pool.query.mockResolvedValue([[mockWeapon]]); // Simulate existing weapon entry

            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Weapon already exists in character\'s inventory');
        });
    });

    describe('addGear', () => {
        it('should add gear and update AC accordingly', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 100, 100, 50);
            const mockGear = new Gear(1, 'Iron Chestplate', 'Chestplate', 300);

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            GearService.searchGearById = jest.fn().mockResolvedValue(mockGear);

            pool.query.mockResolvedValue([[]]); // Simulate no existing gear entry
            pool.query.mockResolvedValueOnce(); // Simulate successful insert

            const updatedCharacter = await CharacterService.addGear(1, 1);

            expect(updatedCharacter.gear).toHaveLength(1);
            expect(updatedCharacter.ac).toBe(350); // 50 base AC + 300 from gear
        });

        it('should throw an error if adding gear exceeds the AC limit', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 100, 100, 900); // Initial AC close to limit
            const mockGear = new Gear(1, 'Iron Chestplate', 'Chestplate', 200);

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            GearService.searchGearById = jest.fn().mockResolvedValue(mockGear);

            await expect(CharacterService.addGear(1, 1)).rejects.toThrow('Adding this gear would exceed the maximum AC of 1000');
        });
    });

    describe('addPotion', () => {
        it('should add a potion to the character', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 100, 100, 50);
            const mockPotion = new Potion(1, 'Healing Potion', { hpRestore: 50, manaRestore: 0, increaseDamage: 0 }, 'Healing');

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            PotionService.searchPotionById = jest.fn().mockResolvedValue(mockPotion);

            pool.query.mockResolvedValue([[]]); // Simulate no existing potion entry
            pool.query.mockResolvedValueOnce(); // Simulate successful insert

            const updatedCharacter = await CharacterService.addPotion(1, 1);

            expect(updatedCharacter.potions).toHaveLength(1);
            expect(updatedCharacter.potions[0].name).toBe('Healing Potion');
        });

        it('should throw an error if the potion already exists', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 100, 100, 50);
            const mockPotion = new Potion(1, 'Healing Potion', { hpRestore: 50, manaRestore: 0, increaseDamage: 0 }, 'Healing');

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            PotionService.searchPotionById = jest.fn().mockResolvedValue(mockPotion);

            pool.query.mockResolvedValue([[mockPotion]]); // Simulate existing potion entry

            await expect(CharacterService.addPotion(1, 1)).rejects.toThrow('Potion already exists in character\'s inventory');
        });
    });

    describe('attack', () => {
        it('should perform a successful attack and reduce the target\'s HP', async () => {
            const attacker = new Character(1, 'Aragorn', 'Human', 1, [], [], [{ id: 1, name: 'Sword', category: 'Melee', damage: 50 }], 100, 100, 50);
            const target = new Character(2, 'Goblin', 'Orc', 2, [], [], [], 100, 100, 20);

            CharacterService.searchCharacterById = jest.fn()
                .mockResolvedValueOnce(attacker)
                .mockResolvedValueOnce(target);

            pool.query.mockResolvedValueOnce(); // Simulate successful update

            const result = await CharacterService.attack(1, 2);

            expect(result.success).toBe(true);
            expect(result.target.hp).toBe(70); // 100 - (50 - 20) = 70
        });

        it('should fail if the target is already defeated', async () => {
            const attacker = new Character(1, 'Aragorn', 'Human', 1, [], [], [{ id: 1, name: 'Sword', category: 'Melee', damage: 50 }], 100, 100, 50);
            const target = new Character(2, 'Goblin', 'Orc', 2, [], [], [], 0, 100, 20); // Already dead

            CharacterService.searchCharacterById = jest.fn()
                .mockResolvedValueOnce(attacker)
                .mockResolvedValueOnce(target);

            const result = await CharacterService.attack(1, 2);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Target is already defeated');
        });
    });

    describe('heal', () => {
        it('should heal the character with a healing potion', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [{ id: 1, name: 'Healing Potion', effects: { hpRestore: 50, manaRestore: 0, increaseDamage: 0 }, utility: 'Healing' }], [], 50, 100, 50);

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);
            pool.query.mockResolvedValueOnce(); // Simulate successful update

            const healedCharacter = await CharacterService.heal(1, 1);

            expect(healedCharacter.hp).toBe(100); // Fully healed
            expect(healedCharacter.potions).toHaveLength(0); // Potion used
        });

        it('should throw an error if the potion does not exist', async () => {
            const mockCharacter = new Character(1, 'Aragorn', 'Human', 1, [], [], [], 50, 100, 50);

            CharacterService.searchCharacterById = jest.fn().mockResolvedValue(mockCharacter);

            await expect(CharacterService.heal(1, 1)).rejects.toThrow('Potion does not exist in character\'s inventory');
        });
    });
});
