// src/__tests__/services/ClassService.test.js
const ClassService = require('../../services/ClassService');
const Class = require('../../models/Class');
const pool = require('../../config/db.js'); 

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

jest.mock('../../config/db.js', () => ({
  query: jest.fn(),
}));

describe('ClassService', () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  test('should create a new class', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: {} };
    pool.query.mockResolvedValue([{ insertId: 1 }]);
    
    const classInstance = await ClassService.createClass(mockClass);

    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO classes (id, name, description, attributes) VALUES (?, ?, ?, ?)',
      [mockClass.id, mockClass.name, mockClass.description, JSON.stringify(mockClass.attributes)]
    );
    expect(classInstance).toEqual(mockClass);
  });

  test('should return all classes', async () => {
    const mockClasses = [
      { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: {} },
      { id: '2', name: 'Warrior', description: 'A brave warrior', attributes: {} }
    ];
    pool.query.mockResolvedValue([mockClasses]);

    const classes = await ClassService.getAllClasses();

    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM classes');
    expect(classes).toEqual(mockClasses);
  });

  test('should return a class by id', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: {} };
    pool.query.mockResolvedValue([[mockClass]]);
  
    const classInstance = await ClassService.getClassById('1');
  
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM classes WHERE id = ?', ['1']);
    expect(classInstance).toEqual(mockClass);
  });
  
  test('should return null if class not found by id', async () => {
    pool.query.mockResolvedValue([[]]);
  
    const classInstance = await ClassService.getClassById('999');
  
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM classes WHERE id = ?', ['999']);
    expect(classInstance).toBeNull();
  });
  
  test('should update a class', async () => {
    const mockClass = { id: '1', name: 'Wizard', description: 'A powerful wizard', attributes: {} };
    const updatedClassData = { name: 'Sorcerer', description: 'Master of magic', attributes: {} };
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    pool.query.mockResolvedValueOnce([[mockClass]]);
  
    const updatedClass = await ClassService.updateClass('1', updatedClassData);
  
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE classes SET name = ?, description = ?, attributes = ? WHERE id = ?',
      [updatedClassData.name, updatedClassData.description, JSON.stringify(updatedClassData.attributes), '1']
    );
    expect(updatedClass).toEqual(mockClass);
  });
  
  test('should return null if class not found for update', async () => {
    const updatedClassData = { name: 'Sorcerer', description: 'Master of magic', attributes: {} };
    pool.query.mockResolvedValue([{ affectedRows: 0 }]); 
  
    const updatedClass = await ClassService.updateClass('999', updatedClassData);
  
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE classes SET name = ?, description = ?, attributes = ? WHERE id = ?',
      [updatedClassData.name, updatedClassData.description, JSON.stringify(updatedClassData.attributes), '999']
    );
    expect(updatedClass).toBeNull();
  });
  
  test('should delete a class by id', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);
  
    const result = await ClassService.deleteClass('1');
  
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM classes WHERE id = ?', ['1']);
    expect(result).toEqual(1);
  });
  
  test('should return null if class not found for deletion', async () => {
    pool.query.mockResolvedValue([{ affectedRows: 0 }]); 
  
    const result = await ClassService.deleteClass('999');
  
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM classes WHERE id = ?', ['999']);
    expect(result).toBeNull();
  });
  
});

