const ClassService = require('../../services/ClassService');
const Class = require('../../models/Class');
const pool = require('../../config/db');

jest.mock('../../models/Class', () => {
  return jest.fn().mockImplementation((id, name, description, attributes) => {
    return {
      id: id || '1',
      name,
      description,
      attributes,
    };
  });
});

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('ClassService', () => {
  
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new class if name is unique', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: {} };

   
    pool.query.mockResolvedValueOnce([[]]);
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]); 

    const classInstance = await ClassService.createClass(mockClass);

    
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM classes WHERE name = ?',
      [mockClass.name]
    );

    
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO classes (id, name, description, attributes) VALUES (?, ?, ?, ?)',
      [mockClass.id, mockClass.name, mockClass.description, JSON.stringify(mockClass.attributes)]
    );

    expect(classInstance).toEqual(mockClass);
  });

  test('should not create a class if name already exists', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: {} };

    
    pool.query.mockResolvedValueOnce([[{ id: '1' }]]); 

    
    await expect(ClassService.createClass(mockClass)).rejects.toThrow(
      `Class with name '${mockClass.name}' already exists`
    );

    
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id FROM classes WHERE name = ?',
      [mockClass.name]
    );
    expect(pool.query).not.toHaveBeenCalledWith(
      'INSERT INTO classes (id, name, description, attributes) VALUES (?, ?, ?, ?)',
      expect.anything()
    );
  });

  test('should return all classes', async () => {
    const mockClasses = [
      { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: '{}' },
      { id: '2', name: 'Warrior', description: 'A strong warrior', attributes: '{}' },
    ];
    pool.query.mockResolvedValue([mockClasses]);

    const classes = await ClassService.getAllClasses();

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, attributes FROM classes');
    expect(classes).toHaveLength(2);
    expect(classes[0].name).toBe('Wizard');
    expect(classes[1].name).toBe('Warrior');
  });

  test('should handle empty result set', async () => {
    pool.query.mockResolvedValue([[]]);

    const classes = await ClassService.getAllClasses();

    expect(classes).toHaveLength(0);
    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, attributes FROM classes');
  });

  test('should return a class by id', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: '{}' };
    pool.query.mockResolvedValue([[mockClass]]);

    const classInstance = await ClassService.searchClassById('1');

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, attributes FROM classes WHERE id = ?', ['1']);
    expect(classInstance).toEqual(mockClass);
  });


  test('should return null if class not found by id', async () => {
    pool.query.mockResolvedValue([[]]);

    const classInstance = await ClassService.searchClassById('999');

    expect(pool.query).toHaveBeenCalledWith('SELECT id, name, description, attributes FROM classes WHERE id = ?', ['999']);
    expect(classInstance).toBeNull();
  });

  test('should update a class', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: '{}' };
    const updatedClassData = { name: 'Updated Wizard', description: 'A very powerful wizard', attributes: '{}' };
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const updatedClass = await ClassService.updateClass('1', updatedClassData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE classes SET name = ?, description = ?, attributes = ? WHERE id = ?',
      [updatedClassData.name, updatedClassData.description, JSON.stringify(updatedClassData.attributes), '1']
    );
    expect(updatedClass).toBe(true);
  });

  test('should return false if class not found for update', async () => {
    const updatedClassData = { name: 'Updated Wizard', description: 'A very powerful wizard', attributes: '{}' };
    pool.query.mockResolvedValue({ affectedRows: 0 }); 

    const updatedClass = await ClassService.updateClass('999', updatedClassData);

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE classes SET name = ?, description = ?, attributes = ? WHERE id = ?',
      [updatedClassData.name, updatedClassData.description, JSON.stringify(updatedClassData.attributes), '999']
    );
    expect(updatedClass).toBe(false);
  });

  test('should delete a class by id', async () => {
    pool.query.mockResolvedValue({ affectedRows: 1 });

    const result = await ClassService.deleteClass('1');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM classes WHERE id = ?', ['1']);
    expect(result).toBe(true);
  });

  test('should return false if class not found for deletion', async () => {
    pool.query.mockResolvedValue({ affectedRows: 0 });

    const result = await ClassService.deleteClass('999');

    expect(pool.query).toHaveBeenCalledWith('DELETE FROM classes WHERE id = ?', ['999']);
    expect(result).toBe(false);
  });
});




