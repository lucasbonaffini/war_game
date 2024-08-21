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

jest.mock('../../db/pool', () => ({
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

  
});

