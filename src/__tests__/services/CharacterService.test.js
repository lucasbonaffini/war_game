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

    describe('CharacterService.createCharacter', () => {

        it('should create a new character and insert it into the database', async () => {
            const mockCharacterData = {
                id: 'adb5b2e8-2389-43ee-9dd4-36fb9bb854a1',
                name: 'Aragorn',
                race: 'Human',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 10
            };
            const mockResult = { insertId: 1 };
            
            pool.query.mockResolvedValueOnce([mockResult]);

            const result = await CharacterService.createCharacter(mockCharacterData);

            expect(result).toEqual(expect.objectContaining({
                id: mockCharacterData.id,
                name: mockCharacterData.name,
                race: mockCharacterData.race,
                classId: mockCharacterData.classId,
                hp: mockCharacterData.hp,
                maxHp: mockCharacterData.maxHp,
                ac: mockCharacterData.ac
            }));

            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [mockCharacterData.id, mockCharacterData.name, mockCharacterData.race, mockCharacterData.classId, mockCharacterData.hp, mockCharacterData.maxHp, mockCharacterData.ac]
            );
        });

        it('should throw an error if the database query fails', async () => {
            const mockCharacterData = {
                id: 'adb5b2e8-2389-43ee-9dd4-36fb9bb854a1',
                name: 'Aragorn',
                race: 'Human',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 10
            };
            const mockError = new Error('Database error');

            pool.query.mockRejectedValueOnce(mockError);

            await expect(CharacterService.createCharacter(mockCharacterData)).rejects.toThrow('Database error');

            expect(console.error).toHaveBeenCalledWith('Error creating character:', mockError);
        });

        it('should log success message when character is created successfully', async () => {
            const mockCharacterData = {
                id: 'adb5b2e8-2389-43ee-9dd4-36fb9bb854a1',
                name: 'Aragorn',
                race: 'Human',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 10
            };
            const mockResult = { insertId: 1 };

            pool.query.mockResolvedValueOnce([mockResult]);

            console.log = jest.fn();

            await CharacterService.createCharacter(mockCharacterData);

            expect(console.log).toHaveBeenCalledWith('Character created successfully:', mockResult.insertId);
        });
    });

    describe('CharacterService.addWeapon', () => {

        it('should add a weapon to the character', async () => {
            const mockCharacter = { id: 1, weapons: [] };
            const mockWeapon = { id: 1 };
            const mockResult = [{ id: 1 }];

            pool.query.mockResolvedValueOnce([mockCharacter]); // Character exists
            pool.query.mockResolvedValueOnce([]); // Weapon not added yet
            pool.query.mockResolvedValueOnce(mockResult); // Insert into character_weapons

            const result = await CharacterService.addWeapon(1, 1);

            expect(result.weapons).toContainEqual(mockWeapon);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)',
                [1, 1]
            );
        });

        it('should throw an error if the weapon is already added to the character', async () => {
            const mockCharacter = { id: 1, weapons: [{ id: 1 }] };

            pool.query.mockResolvedValueOnce([mockCharacter]); // Character exists
            pool.query.mockResolvedValueOnce([mockCharacter.weapons[0]]); // Weapon already exists

            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Weapon already added to this character');
        });

        it('should handle errors and log them', async () => {
            const mockCharacter = { id: 1 };
            const mockError = new Error('Database error');

            pool.query.mockResolvedValueOnce([mockCharacter]); // Character exists
            pool.query.mockRejectedValueOnce(mockError); // Error during insert

            console.error = jest.fn();

            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Database error');

            expect(console.error).toHaveBeenCalledWith('Error adding weapon to character: ', mockError);
        });
    });
});
