const request = require('supertest');
const express = require('express');
const wizardRouter = require('../../routes/WizardRouter');
const WizardService = require('../../services/WizardService');

const app = express();
app.use(express.json());
app.use('/wizards', wizardRouter);

jest.mock('../../services/WizardService');

describe('Wizard Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /wizards should create a new wizard', async () => {
    const mockWizard = {
      id: '1',
      name: 'Gandalf',
      mana: 500,
      maxMana: 500,
      spells: []
    };
    WizardService.createWizard.mockResolvedValue(mockWizard);

    const response = await request(app)
      .post('/wizards')
      .send(mockWizard);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockWizard);
    expect(WizardService.createWizard).toHaveBeenCalledWith(mockWizard);
  });

  test('GET /wizards should return all wizards', async () => {
    const mockWizards = [
      { id: '1', name: 'Gandalf', mana: 500, maxMana: 500, spells: [] },
      { id: '2', name: 'Saruman', mana: 600, maxMana: 600, spells: [] }
    ];
    WizardService.getAllWizards.mockResolvedValue(mockWizards);

    const response = await request(app)
      .get('/wizards')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWizards);
    expect(WizardService.getAllWizards).toHaveBeenCalled();
  });

  test('GET /wizards/:id should return wizard by id', async () => {
    const mockWizard = {
      id: '1',
      name: 'Gandalf',
      mana: 500,
      maxMana: 500,
      spells: []
    };
    WizardService.searchWizardById.mockResolvedValue(mockWizard);

    const response = await request(app)
      .get('/wizards/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWizard);
    expect(WizardService.searchWizardById).toHaveBeenCalledWith('1');
  });

  test('GET /wizards/:id should return 404 if wizard not found', async () => {
    WizardService.searchWizardById.mockResolvedValue(null);

    const response = await request(app)
      .get('/wizards/999')
      .send();

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Wizard not found' });
    expect(WizardService.searchWizardById).toHaveBeenCalledWith('999');
  });

  test('PUT /wizards/:id should update wizard', async () => {
    const updatedWizardData = {
      name: 'Gandalf the White',
      mana: 600,
      maxMana: 600
    };
    WizardService.updateWizard.mockResolvedValue(true);

    const response = await request(app)
      .put('/wizards/1')
      .send(updatedWizardData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Wizard updated successfully' });
    expect(WizardService.updateWizard).toHaveBeenCalledWith('1', updatedWizardData);
  });

  test('PUT /wizards/:id should return 404 if wizard not found for update', async () => {
    const updatedWizardData = {
      name: 'Gandalf the White',
      mana: 600,
      maxMana: 600
    };
    WizardService.updateWizard.mockResolvedValue(false);

    const response = await request(app)
      .put('/wizards/999')
      .send(updatedWizardData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Wizard not found' });
    expect(WizardService.updateWizard).toHaveBeenCalledWith('999', updatedWizardData);
  });

  test('DELETE /wizards/:id should delete wizard by id', async () => {
    WizardService.deleteWizard.mockResolvedValue(true);

    const response = await request(app)
      .delete('/wizards/1')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Wizard deleted successfully' });
    expect(WizardService.deleteWizard).toHaveBeenCalledWith('1');
  });

  test('DELETE /wizards/:id should return 404 if wizard not found for deletion', async () => {
    WizardService.deleteWizard.mockResolvedValue(false);

    const response = await request(app)
      .delete('/wizards/999')
      .send();

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Wizard not found' });
    expect(WizardService.deleteWizard).toHaveBeenCalledWith('999');
  });

  test('POST /wizards/attack should perform an attack', async () => {
    const attackResult = { success: true, damage: 100 };
    WizardService.castSpell.mockResolvedValue(attackResult);

    const response = await request(app)
      .post('/wizards/attack')
      .send({
        attackerId: '1',
        targetId: '2',
        spellId: '3'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(attackResult);
    expect(WizardService.castSpell).toHaveBeenCalledWith('1', '2', '3');
  });

  test('POST /wizards/:id/restore-mana should restore mana for a wizard', async () => {
    const mockWizard = {
      id: '1',
      name: 'Gandalf',
      mana: 500,
      maxMana: 500,
      spells: []
    };
    WizardService.restoreMana.mockResolvedValue(mockWizard);

    const response = await request(app)
      .post('/wizards/1/restore-mana')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWizard);
    expect(WizardService.restoreMana).toHaveBeenCalledWith('1');
  });

  test('POST /wizards/:id/add-spell should add a spell to a wizard', async () => {
    const mockWizard = {
      id: '1',
      name: 'Gandalf',
      mana: 500,
      maxMana: 500,
      spells: [{ id: '1', name: 'Fireball' }]
    };
    WizardService.addSpell.mockResolvedValue(mockWizard);

    const response = await request(app)
      .post('/wizards/1/add-spell')
      .send({ spellId: '1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWizard);
    expect(WizardService.addSpell).toHaveBeenCalledWith('1', '1');
  });
});
