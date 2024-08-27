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

    describe('CharacterService.createCharacter', () => {
        let mockCharacterData;
    
        beforeEach(() => {
            mockCharacterData = {
                name: 'Aragorn',
                race: 'Human',
                classId: 1,
                hp: 100,
                maxHp: 100,
                ac: 15
            };
    
            // Reset and mock the pool query
            pool.query = jest.fn();
        });
    
        it('should create a new character and insert it into the database', async () => {
            const mockResult = { insertId: 1 };
            pool.query.mockResolvedValueOnce([mockResult]);
    
            const result = await CharacterService.createCharacter(mockCharacterData);
    
            expect(result).toBeInstanceOf(Character);
            expect(result.name).toBe(mockCharacterData.name);
            expect(result.race).toBe(mockCharacterData.race);
            expect(result.classId).toBe(mockCharacterData.classId);
            expect(result.hp).toBe(mockCharacterData.hp);
            expect(result.maxHp).toBe(mockCharacterData.maxHp);
            expect(result.ac).toBe(mockCharacterData.ac);
    
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO characters (id, name, race, class_id, hp, maxHp, ac) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [undefined, mockCharacterData.name, mockCharacterData.race, mockCharacterData.classId, mockCharacterData.hp, mockCharacterData.maxHp, mockCharacterData.ac]
            );
        });
    
        it('should throw an error if the database query fails', async () => {
            const mockError = new Error('Database error');
            pool.query.mockRejectedValueOnce(mockError);
    
            await expect(CharacterService.createCharacter(mockCharacterData)).rejects.toThrow('Database error');
            expect(console.error).toHaveBeenCalledWith('Error creating character:', mockError);
        });
    
        it('should log success message when character is created successfully', async () => {
            const mockResult = { insertId: 1 };
            pool.query.mockResolvedValueOnce([mockResult]);
    
            console.log = jest.fn();
    
            await CharacterService.createCharacter(mockCharacterData);
    
            expect(console.log).toHaveBeenCalledWith('Character created successfully:', mockResult);
        });
    });
    



    describe('CharacterService.addWeapon', () => {
        it('should add a weapon to the character', async () => {
            const characterId = 1;
            const weaponId = 1;
            const mockCharacter = { id: characterId, weapons: [] };
            const mockWeapon = { id: weaponId };
    
            jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
            jest.spyOn(WeaponService, 'searchWeaponById').mockResolvedValue(mockWeapon);
            pool.query.mockResolvedValueOnce([]); // No existing weapon for this character
    
            const result = await CharacterService.addWeapon(characterId, weaponId);
    
            expect(result.weapons).toContain(mockWeapon);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM character_weapons WHERE character_id = ? AND weapon_id = ?',
                [characterId, weaponId]
            );
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO character_weapons (character_id, weapon_id) VALUES (?, ?)',
                [characterId, weaponId]
            );
        });
    
        it('should throw an error if the character is not found', async () => {
            jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(null);
    
            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Character not found');
        });
    
        it('should throw an error if the weapon is not found', async () => {
            const mockCharacter = { id: 1, weapons: [] };
    
            jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
            jest.spyOn(WeaponService, 'searchWeaponById').mockResolvedValue(null);
    
            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Weapon not found');
        });
    
        it('should throw an error if the weapon is already added to the character', async () => {
            const mockCharacter = { id: 1, weapons: [] };
            const mockWeapon = { id: 1 };
    
            jest.spyOn(CharacterService, 'searchCharacterById').mockResolvedValue(mockCharacter);
            jest.spyOn(WeaponService, 'searchWeaponById').mockResolvedValue(mockWeapon);
            pool.query.mockResolvedValueOnce([mockWeapon]); // Weapon already exists
    
            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Weapon already added to this character');
        });
    
        it('should handle errors and log them', async () => {
            jest.spyOn(CharacterService, 'searchCharacterById').mockRejectedValue(new Error('Database error'));
    
            await expect(CharacterService.addWeapon(1, 1)).rejects.toThrow('Database error');
            expect(console.error).toHaveBeenCalledWith('Error adding weapon to character: ', expect.any(Error));
        });
    });

});
