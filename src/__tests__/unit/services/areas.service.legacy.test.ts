/**
 * Areas Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/areas.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockArea = { id: 'area-1', name: 'North Region', city: 'Springfield' };

describe('areasService (legacy JS)', () => {
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
    it('should return areas list', async () => {
      mock.onGet('/areas/').reply(200, [mockArea]);
      const result = await service.getAll();
      expect(result[0].name).toBe('North Region');
    });

    it('should pass filters', async () => {
      mock.onGet('/areas/').reply(200, []);
      const result = await service.getAll({ city: 'Springfield' });
      expect(result).toEqual([]);
    });

    it('should throw on 500', async () => {
      mock.onGet('/areas/').reply(500);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should return area by ID', async () => {
      mock.onGet('/areas/area-1/').reply(200, mockArea);
      const result = await service.getById('area-1');
      expect(result.id).toBe('area-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/areas/bad/').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create area', async () => {
      mock.onPost('/areas/').reply(201, mockArea);
      const result = await service.create({ name: 'North Region', city: 'Springfield' });
      expect(result.id).toBe('area-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/areas/').reply(400, { message: 'Name required' });
      await expect(service.create({})).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update area', async () => {
      mock.onPut('/areas/area-1/').reply(200, { ...mockArea, name: 'South Region' });
      const result = await service.update('area-1', { name: 'South Region' });
      expect(result.name).toBe('South Region');
    });
  });

  describe('delete', () => {
    it('should delete area', async () => {
      mock.onDelete('/areas/area-1/').reply(200, { message: 'Deleted' });
      const result = await service.delete('area-1');
      expect(result.message).toBe('Deleted');
    });
  });
});
