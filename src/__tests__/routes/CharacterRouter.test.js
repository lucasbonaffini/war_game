const request = require('supertest');
const express = require('express');
const characterRouter = require('../../routes/CharacterRouter');
const CharacterService = require('../../services/CharacterService');

const app = express();
app.use(express.json());
app.use('/characters', characterRouter);

jest.mock('../../services/CharacterService');

describe('Character Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /characters should create a new character', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Hero',
      hp: 100,
      maxHp: 100,
      race: 'Elf',
      class_id: 1,
      ac: 10
    };
    CharacterService.createCharacter.mockResolvedValue(mockCharacter);

    const response = await request(app)
      .post('/characters')
      .send(mockCharacter);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCharacter);
    expect(CharacterService.createCharacter).toHaveBeenCalledWith(mockCharacter);
  });

  test('GET /characters/:id should return character by id', async () => {
    const mockCharacter = {
      id: '1',
      name: 'Hero',
      hp: 100,
      maxHp: 100,
      race: 'Elf',
      class_id: 1,
      ac: 10
    };
    CharacterService.searchCharacterById.mockResolvedValue(mockCharacter);

    const response = await request(app)
      .get('/characters/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacter);
    expect(CharacterService.searchCharacterById).toHaveBeenCalledWith('1');
  });

  test('GET /characters/:id should return 404 if character not found', async () => {
    CharacterService.searchCharacterById.mockResolvedValue(null);

    const response = await request(app)
      .get('/characters/999')
      .send();

    expect(response.status).toBe(404);
    expect(response.text).toBe('Character not found');
    expect(CharacterService.searchCharacterById).toHaveBeenCalledWith('999');
  });

  test('PUT /characters/:id should update character', async () => {
    const updatedCharacterData = {
      name: 'Updated Hero',
      hp: 150,
      maxHp: 150,
      race: 'Human',
      class_id: 2,
      ac: 20
    };
    CharacterService.updateCharacter.mockResolvedValue(true);

    const response = await request(app)
      .put('/characters/1')
      .send(updatedCharacterData);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Character updated successfully');
    expect(CharacterService.updateCharacter).toHaveBeenCalledWith('1', updatedCharacterData);
  });

  test('PUT /characters/:id should return 404 if character not found for update', async () => {
    const updatedCharacterData = {
      name: 'Updated Hero',
      hp: 150,
      maxHp: 150,
      race: 'Human',
      class_id: 2,
      ac: 20
    };
    CharacterService.updateCharacter.mockResolvedValue(false);

    const response = await request(app)
      .put('/characters/999')
      .send(updatedCharacterData);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Character not found');
    expect(CharacterService.updateCharacter).toHaveBeenCalledWith('999', updatedCharacterData);
  });

  test('DELETE /characters/:id should delete character by id', async () => {
    CharacterService.deleteCharacter.mockResolvedValue(true);

    const response = await request(app)
      .delete('/characters/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.text).toBe('Character deleted successfully');
    expect(CharacterService.deleteCharacter).toHaveBeenCalledWith('1');
  });

  test('DELETE /characters/:id should return 404 if character not found for deletion', async () => {
    CharacterService.deleteCharacter.mockResolvedValue(false);

    const response = await request(app)
      .delete('/characters/999')
      .send();

    expect(response.status).toBe(404);
    expect(response.text).toBe('Character not found');
    expect(CharacterService.deleteCharacter).toHaveBeenCalledWith('999');
  });

  test('GET /characters should return all characters', async () => {
    const mockCharacters = [
      {
        id: '1',
        name: 'Hero1',
        hp: 100,
        maxHp: 100,
        race: 'Elf',
        class_id: 1,
        ac: 10
      },
      {
        id: '2',
        name: 'Hero2',
        hp: 150,
        maxHp: 150,
        race: 'Dwarf',
        class_id: 2,
        ac: 20
      }
    ];
    CharacterService.getAllCharacters.mockResolvedValue(mockCharacters);

    const response = await request(app)
      .get('/characters')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacters);
    expect(CharacterService.getAllCharacters).toHaveBeenCalled();
  });

  test('POST /characters/attack should perform an attack', async () => {
    const attackResult = { success: true, damage: 50 };
    CharacterService.attack.mockResolvedValue(attackResult);

    const response = await request(app)
      .post('/characters/attack')
      .send({
        attackerId: '1',
        targetId: '2',
        weaponId: '3'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(attackResult);
    expect(CharacterService.attack).toHaveBeenCalledWith('1', '2', '3');
  });

  test('POST /characters/gears/:characterId/:gearId should add gear to a character', async () => {
    const mockCharacter = { id: '1', name: 'Hero', gear: [{ id: '1', name: 'Helmet', armorClass: 50 }] };
    CharacterService.addGear.mockResolvedValue(mockCharacter);

    const response = await request(app)
      .post('/characters/gears/1/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacter);
    expect(CharacterService.addGear).toHaveBeenCalledWith('1', '1');
  });

  test('POST /characters/weapons/:characterId/:weaponId should add weapon to a character', async () => {
    const mockCharacter = { id: '1', name: 'Hero', weapons: [{ id: '1', name: 'Sword', damage: 20 }] };
    CharacterService.addWeapon.mockResolvedValue(mockCharacter);

    const response = await request(app)
      .post('/characters/weapons/1/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacter);
    expect(CharacterService.addWeapon).toHaveBeenCalledWith('1', '1');
  });

  test('POST /characters/potions/:characterId/:potionId should add potion to a character', async () => {
    const mockCharacter = { id: '1', name: 'Hero', potions: [{ id: '1', name: 'Health Potion', effects: { hpRestore: 50 } }] };
    CharacterService.addPotion.mockResolvedValue(mockCharacter);

    const response = await request(app)
      .post('/characters/potions/1/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacter);
    expect(CharacterService.addPotion).toHaveBeenCalledWith('1', '1');
  });

  test('POST /characters/heal/:characterId should heal a character', async () => {
    const mockCharacter = { id: '1', name: 'Hero', hp: 100, maxHp: 100 };
    CharacterService.heal.mockResolvedValue(mockCharacter);

    const response = await request(app)
      .post('/characters/heal/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCharacter);
    expect(CharacterService.heal).toHaveBeenCalledWith('1');
  });
});
