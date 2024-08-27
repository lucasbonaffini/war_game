const WizardService = require('../../services/WizardService');
const pool = require('../../config/db');

jest.mock('../../config/db');

describe('WizardService', () => {
  let connection;

  beforeEach(() => {
    connection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(connection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new wizard', async () => {
    const mockWizard = { id: '1', name: 'Gandalf', race: 'Maiar', classId: '1', hp: 100, maxHp: 100, ac: 15, mana: 1000, maxMana: 1000 };
    const mockClass = { id: '1', name: 'Wizard', abilities: [] };
    
    connection.query.mockResolvedValueOnce([{ insertId: 1 }]);
    ClassService.searchClassById = jest.fn().mockResolvedValue(mockClass);

    const wizardInstance = await WizardService.createWizard(mockWizard);

    expect(connection.query).toHaveBeenCalledWith(
      'INSERT INTO characters (name, race, classId, hp, maxHp, ac, mana, maxMana) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [mockWizard.name, mockWizard.race, mockWizard.classId, mockWizard.hp, mockWizard.maxHp, mockWizard.ac, mockWizard.mana, mockWizard.maxMana]
    );
    expect(wizardInstance).toEqual(expect.objectContaining(mockWizard));
  });

  test('should return all wizards', async () => {
    const mockWizards = [
      { id: '1', name: 'Gandalf', race: 'Maiar', classId: '1', hp: 100, maxHp: 100, ac: 15, mana: 1000, maxMana: 1000 },
      { id: '2', name: 'Saruman', race: 'Maiar', classId: '1', hp: 90, maxHp: 90, ac: 14, mana: 900, maxMana: 900 },
    ];

    connection.query.mockResolvedValue([mockWizards]);

    const wizards = await WizardService.getAllWizards();

    expect(connection.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE classId = (SELECT id FROM classes WHERE name = ?)', ['Wizard']);
    expect(wizards).toHaveLength(2);
    expect(wizards[0].name).toBe('Gandalf');
    expect(wizards[1].name).toBe('Saruman');
  });

  test('should return a wizard by id', async () => {
    const mockWizard = { id: '1', name: 'Gandalf', race: 'Maiar', classId: '1', hp: 100, maxHp: 100, ac: 15, mana: 1000, maxMana: 1000 };
    const mockClass = { id: '1', name: 'Wizard', abilities: [] };

    connection.query.mockResolvedValueOnce([[mockWizard]]);
    ClassService.searchClassById = jest.fn().mockResolvedValue(mockClass);

    const wizardInstance = await WizardService.searchWizardById('1');

    expect(connection.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['1']);
    expect(wizardInstance).toEqual(mockWizard);
  });

  test('should return null if wizard not found by id', async () => {
    connection.query.mockResolvedValueOnce([[]]);

    const wizardInstance = await WizardService.searchWizardById('999');

    expect(connection.query).toHaveBeenCalledWith('SELECT * FROM characters WHERE id = ?', ['999']);
    expect(wizardInstance).toBeNull();
  });

  test('should update a wizard', async () => {
    const mockWizard = { id: '1', name: 'Gandalf', race: 'Maiar', classId: '1', hp: 100, maxHp: 100, ac: 15, mana: 1000, maxMana: 1000 };
    const updatedWizardData = { name: 'Gandalf the White', race: 'Maiar', classId: '1', hp: 150, maxHp: 150, ac: 20, mana: 2000, maxMana: 2000 };

    connection.query.mockResolvedValueOnce({ affectedRows: 1 });

    const updatedWizard = await WizardService.updateWizard('1', updatedWizardData);

    expect(connection.query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, classId = ?, hp = ?, maxHp = ?, ac = ?, mana = ?, maxMana = ? WHERE id = ?',
      [updatedWizardData.name, updatedWizardData.race, updatedWizardData.classId, updatedWizardData.hp, updatedWizardData.maxHp, updatedWizardData.ac, updatedWizardData.mana, updatedWizardData.maxMana, '1']
    );
    expect(updatedWizard).toBe(true);
  });

  test('should return false if wizard not found for update', async () => {
    const updatedWizardData = { name: 'Gandalf the White', race: 'Maiar', classId: '1', hp: 150, maxHp: 150, ac: 20, mana: 2000, maxMana: 2000 };

    connection.query.mockResolvedValueOnce({ affectedRows: 0 });

    const updatedWizard = await WizardService.updateWizard('999', updatedWizardData);

    expect(connection.query).toHaveBeenCalledWith(
      'UPDATE characters SET name = ?, race = ?, classId = ?, hp = ?, maxHp = ?, ac = ?, mana = ?, maxMana = ? WHERE id = ?',
      [updatedWizardData.name, updatedWizardData.race, updatedWizardData.classId, updatedWizardData.hp, updatedWizardData.maxHp, updatedWizardData.ac, updatedWizardData.mana, updatedWizardData.maxMana, '999']
    );
    expect(updatedWizard).toBe(false);
  });

  test('should delete a wizard by id', async () => {
    connection.query.mockResolvedValueOnce({ affectedRows: 1 });

    const result = await WizardService.deleteWizard('1');

    expect(connection.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if wizard not found for deletion', async () => {
    connection.query.mockResolvedValueOnce({ affectedRows: 0 });

    const result = await WizardService.deleteWizard('999');

    expect(connection.query).toHaveBeenCalledWith('DELETE FROM characters WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
});


