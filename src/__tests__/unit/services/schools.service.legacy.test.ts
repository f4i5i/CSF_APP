/**
 * Schools Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/schools.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockSchool = { id: 'sch-1', name: 'Springfield Elementary', address: '123 Main St' };

describe('schoolsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return schools', async () => {
      mock.onGet('/schools/').reply(200, [mockSchool]);
      const result = await service.getAll();
      expect(result[0].name).toBe('Springfield Elementary');
    });

    it('should pass filters', async () => {
      mock.onGet('/schools/').reply(200, []);
      await service.getAll({ city: 'Springfield' });
    });

    it('should throw on 500', async () => {
      mock.onGet('/schools/').reply(500);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should return school', async () => {
      mock.onGet('/schools/sch-1/').reply(200, mockSchool);
      const result = await service.getById('sch-1');
      expect(result.address).toBe('123 Main St');
    });

    it('should throw on 404', async () => {
      mock.onGet('/schools/bad/').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create school', async () => {
      mock.onPost('/schools/').reply(201, mockSchool);
      const result = await service.create({ name: 'Springfield Elementary' });
      expect(result.id).toBe('sch-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/schools/').reply(400, { message: 'Name required' });
      await expect(service.create({})).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update school', async () => {
      mock.onPut('/schools/sch-1/').reply(200, { ...mockSchool, name: 'Updated School' });
      const result = await service.update('sch-1', { name: 'Updated School' });
      expect(result.name).toBe('Updated School');
    });

    it('should throw on 404', async () => {
      mock.onPut('/schools/bad/').reply(404);
      await expect(service.update('bad', {})).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete school', async () => {
      mock.onDelete('/schools/sch-1/').reply(200, { message: 'Deleted' });
      const result = await service.delete('sch-1');
      expect(result.message).toBe('Deleted');
    });

    it('should throw on 404', async () => {
      mock.onDelete('/schools/bad/').reply(404);
      await expect(service.delete('bad')).rejects.toThrow();
    });
  });
});
