// Mock explícito de Class
jest.mock('../../models/Class', () => {
    return {
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };
  });
  
  describe('ClassService', () => {
    afterEach(() => {
      jest.clearAllMocks(); // Limpiar los mocks después de cada prueba
    });
  
    test('should create a new class', async () => {
      const mockClass = { id: '1', name: 'Wizard' };
      Class.create.mockResolvedValue(mockClass); // Mockear método create
  
      const classInstance = await ClassService.createClass(mockClass);
  
      expect(Class.create).toHaveBeenCalledWith(mockClass);
      expect(classInstance).toEqual(mockClass);
    });
  
    test('should update existing class', async () => {
      const mockClass = { name: 'Warrior' };
      Class.update.mockResolvedValue([1]); // Mockear método update
  
      const updated = await ClassService.updateClass('1', mockClass);
  
      expect(Class.update).toHaveBeenCalledWith(mockClass, { where: { id: '1' } });
      expect(updated).toBeTruthy();
    });
  
    test('should delete class by id', async () => {
      Class.destroy.mockResolvedValue(1); // Mockear método destroy
  
      const deleted = await ClassService.deleteClass('1');
  
      expect(Class.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(deleted).toBeTruthy();
    });
  });
  
