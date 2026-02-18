/**
 * Programs Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/programs.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockProgram = { id: 'prog-1', name: 'Soccer Academy', sport_type: 'soccer', active: true };

describe('programsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.getClasses).toBe('function');
      expect(typeof service.getEnrollments).toBe('function');
      expect(typeof service.getStats).toBe('function');
      expect(typeof service.getActive).toBe('function');
      expect(typeof service.getBySportType).toBe('function');
      expect(typeof service.getBySeason).toBe('function');
      expect(typeof service.getOpenForRegistration).toBe('function');
      expect(typeof service.toggleRegistration).toBe('function');
      expect(typeof service.getFeatured).toBe('function');
      expect(typeof service.setFeatured).toBe('function');
      expect(typeof service.uploadImage).toBe('function');
      expect(typeof service.getSchedule).toBe('function');
      expect(typeof service.search).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return programs', async () => {
      mock.onGet('/programs/').reply(200, [mockProgram]);
      const result = await service.getAll();
      expect(result[0].name).toBe('Soccer Academy');
    });

    it('should pass filters', async () => {
      mock.onGet('/programs/').reply(200, []);
      await service.getAll({ sport_type: 'soccer', active: true });
    });

    it('should throw on 500', async () => {
      mock.onGet('/programs/').reply(500);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should return program', async () => {
      mock.onGet('/programs/prog-1/').reply(200, mockProgram);
      const result = await service.getById('prog-1');
      expect(result.sport_type).toBe('soccer');
    });

    it('should throw on 404', async () => {
      mock.onGet('/programs/bad/').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create program', async () => {
      mock.onPost('/programs/').reply(201, mockProgram);
      const result = await service.create({ name: 'Soccer Academy' });
      expect(result.id).toBe('prog-1');
    });
  });

  describe('update', () => {
    it('should update program', async () => {
      mock.onPut('/programs/prog-1/').reply(200, { ...mockProgram, name: 'Updated' });
      const result = await service.update('prog-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete program', async () => {
      mock.onDelete('/programs/prog-1/').reply(200, { message: 'Deleted' });
      const result = await service.delete('prog-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('getClasses', () => {
    it('should return program classes', async () => {
      mock.onGet(/\/programs\/prog-1/).reply(200, [{ id: 'cls-1' }]);
      const result = await service.getClasses('prog-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getEnrollments', () => {
    it('should return program enrollments', async () => {
      mock.onGet(/\/programs\/prog-1/).reply(200, []);
      const result = await service.getEnrollments('prog-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return program stats', async () => {
      mock.onGet(/\/programs\/prog-1/).reply(200, { total_enrollments: 50 });
      const result = await service.getStats('prog-1');
      expect(result.total_enrollments).toBe(50);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mock.onGet('/programs/').reply(200, [mockProgram]);
    });

    it('getActive should filter active', async () => {
      const result = await service.getActive();
      expect(Array.isArray(result)).toBe(true);
    });

    it('getBySportType should filter by sport', async () => {
      const result = await service.getBySportType('soccer');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getBySeason should filter by season', async () => {
      const result = await service.getBySeason('Fall');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getOpenForRegistration', () => {
    it('should return open programs', async () => {
      mock.onGet(/\/programs\//).reply(200, [mockProgram]);
      const result = await service.getOpenForRegistration();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('toggleRegistration', () => {
    it('should toggle registration', async () => {
      mock.onPost(/\/programs\/prog-1/).reply(200, { ...mockProgram, registration_open: false });
      const result = await service.toggleRegistration('prog-1', false);
      expect(result.registration_open).toBe(false);
    });
  });

  describe('getFeatured', () => {
    it('should return featured programs', async () => {
      mock.onGet(/\/programs\//).reply(200, [mockProgram]);
      const result = await service.getFeatured();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('setFeatured', () => {
    it('should set featured', async () => {
      mock.onPost(/\/programs\/prog-1/).reply(200, { featured: true });
      const result = await service.setFeatured('prog-1', true);
      expect(result.featured).toBe(true);
    });
  });

  describe('uploadImage', () => {
    it('should upload program image', async () => {
      mock.onPost(/\/programs\/prog-1/).reply(200, { image_url: 'https://example.com/img.jpg' });
      const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });
      const result = await service.uploadImage('prog-1', file);
      expect(result.image_url).toBeDefined();
    });
  });

  describe('getSchedule', () => {
    it('should return schedule', async () => {
      mock.onGet(/\/programs\/prog-1/).reply(200, [{ date: '2024-01-15' }]);
      const result = await service.getSchedule('prog-1', { start_date: '2024-01-01' });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('search', () => {
    it('should search programs', async () => {
      mock.onGet(/\/programs\//).reply(200, [mockProgram]);
      const result = await service.search('soccer');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
