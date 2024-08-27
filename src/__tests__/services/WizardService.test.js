const WizardService = require('../../services/WizardService');
const Wizard = require('../../models/Wizard');
const pool = require('../../config/db');

jest.mock('../../models/Wizard', () => {
  return jest.fn().mockImplementation((id, name, mana, maxMana, classId) => {
    return {
      id: id || '1',
      name,
      mana,
      maxMana,
      classId,
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('WizardService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new wizard', async () => {
    const mockWizard = { id: '1', name: 'Gandalf', mana: 1000, maxMana: 1000, classId: 1 };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const wizardInstance = await WizardService.createWizard(mockWizard);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO wizards (id, name, mana, maxMana, classId) VALUES (?, ?, ?, ?, ?)',
      [mockWizard.id, mockWizard.name, mockWizard.mana, mockWizard.maxMana, mockWizard.classId]
    );
    expect(wizardInstance).toEqual(mockWizard);
  });

  test('should return all wizards', async () => {
    const mockWizards = [
      { id: '1', name: 'Gandalf', mana: 1000, maxMana: 1000, classId: 1 },
      { id: '2', name: 'Saruman', mana: 1200, maxMana: 1200, classId: 1 },
    ];
    pool.query.mockResolvedValue([mockWizards]);

    const wizards = await WizardService.getAllWizards();

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM wizards');
    expect(wizards).toHaveLength(2);
    expect(wizards[0].name).toBe('Gandalf');
    expect(wizards[1].name).toBe('Saruman');
  });

  test('should return a wizard by id', async () => {
    const mockWizard = { id: '1', name: 'Gandalf', mana: 1000, maxMana: 1000, classId: 1 };
    pool.query.mockResolvedValue([[mockWizard]]);

    const wizardInstance = await WizardService.searchWizardById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM wizards WHERE id = ?', ['1']);
    expect(wizardInstance).toEqual(mockWizard);
  });

  test('should return null if wizard not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const wizardInstance = await WizardService.searchWizardById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM wizards WHERE id = ?', ['999']);
    expect(wizardInstance).toBeNull();
  });

  test('should update a wizard', async () => {
    const mockWizard = { id: '1', name: 'Gandalf', mana: 1000, maxMana: 1000, classId: 1 };
    const updatedWizardData = { name: 'Gandalf the White', mana: 1500, maxMana: 1500 };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedWizard = await WizardService.updateWizard('1', updatedWizardData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE wizards SET name = ?, mana = ?, maxMana = ? WHERE id = ?',
      [updatedWizardData.name, updatedWizardData.mana, updatedWizardData.maxMana, '1']
    );
    expect(updatedWizard).toBe(true);
  });

  test('should return false if wizard not found for update', async () => {
    const updatedWizardData = { name: 'Gandalf the White', mana: 1500, maxMana: 1500 };
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const updatedWizard = await WizardService.updateWizard('999', updatedWizardData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE wizards SET name = ?, mana = ?, maxMana = ? WHERE id = ?',
      [updatedWizardData.name, updatedWizardData.mana, updatedWizardData.maxMana, '999']
    );
    expect(updatedWizard).toBe(false);
  });

  test('should delete a wizard by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await WizardService.deleteWizard('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM wizards WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if wizard not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const result = await WizardService.deleteWizard('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM wizards WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
});

