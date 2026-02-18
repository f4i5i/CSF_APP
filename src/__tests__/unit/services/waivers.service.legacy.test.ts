/**
 * Waivers Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/waivers.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockTemplate = { id: 'tpl-1', name: 'Liability Waiver', waiver_type: 'liability', is_active: true };
const mockAcceptance = { id: 'acc-1', waiver_template_id: 'tpl-1', signer_name: 'John Doe' };

describe('waiversService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getRequired).toBe('function');
      expect(typeof service.getPending).toBe('function');
      expect(typeof service.accept).toBe('function');
      expect(typeof service.getMyAcceptances).toBe('function');
      expect(typeof service.getAcceptanceById).toBe('function');
      expect(typeof service.getTemplates).toBe('function');
      expect(typeof service.getTemplateById).toBe('function');
      expect(typeof service.createTemplate).toBe('function');
      expect(typeof service.updateTemplate).toBe('function');
      expect(typeof service.deleteTemplate).toBe('function');
      expect(typeof service.signMultiple).toBe('function');
      expect(typeof service.checkCompletionStatus).toBe('function');
      expect(typeof service.getAcceptances).toBe('function');
      expect(typeof service.getStats).toBe('function');
    });
  });

  // ============== User Waiver Endpoints ==============

  describe('getRequired', () => {
    it('should return required waivers', async () => {
      mock.onGet('/waivers/required').reply(200, { items: [{ waiver_template: mockTemplate, is_accepted: false }], pending_count: 1, total: 1 });
      const result = await service.getRequired();
      expect(result.pending_count).toBe(1);
    });

    it('should pass params', async () => {
      mock.onGet('/waivers/required').reply(200, { items: [], pending_count: 0, total: 0 });
      await service.getRequired({ program_id: 'prog-1' });
    });
  });

  describe('getPending', () => {
    it('should return pending waivers', async () => {
      mock.onGet('/waivers/pending').reply(200, { items: [{ waiver_template: mockTemplate }], pending_count: 1, total: 1 });
      const result = await service.getPending();
      expect(result.pending_count).toBe(1);
    });
  });

  describe('accept', () => {
    it('should accept waiver', async () => {
      mock.onPost('/waivers/accept').reply(200, mockAcceptance);
      const result = await service.accept({ waiver_template_id: 'tpl-1', signer_name: 'John Doe' });
      expect(result.signer_name).toBe('John Doe');
    });

    it('should throw on 400', async () => {
      mock.onPost('/waivers/accept').reply(400, { message: 'Already accepted' });
      await expect(service.accept({ waiver_template_id: 'tpl-1' })).rejects.toThrow();
    });
  });

  describe('getMyAcceptances', () => {
    it('should return acceptances', async () => {
      mock.onGet('/waivers/my-acceptances').reply(200, { items: [mockAcceptance], total: 1 });
      const result = await service.getMyAcceptances();
      expect(result.items[0].id).toBe('acc-1');
    });
  });

  describe('getAcceptanceById', () => {
    it('should return acceptance by ID', async () => {
      mock.onGet('/waivers/acceptances/acc-1').reply(200, mockAcceptance);
      const result = await service.getAcceptanceById('acc-1');
      expect(result.id).toBe('acc-1');
    });
  });

  // ============== Admin Template Endpoints ==============

  describe('getTemplates', () => {
    it('should return templates', async () => {
      mock.onGet('/waivers/templates').reply(200, { items: [mockTemplate], total: 1 });
      const result = await service.getTemplates();
      expect(result.items[0].name).toBe('Liability Waiver');
    });

    it('should pass params', async () => {
      mock.onGet('/waivers/templates').reply(200, { items: [], total: 0 });
      await service.getTemplates({ include_inactive: true });
    });
  });

  describe('getTemplateById', () => {
    it('should return template by ID', async () => {
      mock.onGet('/waivers/templates/tpl-1').reply(200, mockTemplate);
      const result = await service.getTemplateById('tpl-1');
      expect(result.waiver_type).toBe('liability');
    });

    it('should throw on 404', async () => {
      mock.onGet('/waivers/templates/bad').reply(404);
      await expect(service.getTemplateById('bad')).rejects.toThrow();
    });
  });

  describe('createTemplate', () => {
    it('should create template', async () => {
      mock.onPost('/waivers/templates').reply(201, mockTemplate);
      const result = await service.createTemplate({ name: 'Liability Waiver', waiver_type: 'liability', content: 'Text' });
      expect(result.id).toBe('tpl-1');
    });
  });

  describe('updateTemplate', () => {
    it('should update template', async () => {
      mock.onPut('/waivers/templates/tpl-1').reply(200, { ...mockTemplate, name: 'Updated' });
      const result = await service.updateTemplate('tpl-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template', async () => {
      mock.onDelete('/waivers/templates/tpl-1').reply(200, { message: 'Deleted' });
      const result = await service.deleteTemplate('tpl-1');
      expect(result.message).toBe('Deleted');
    });
  });

  // ============== Helper Methods ==============

  describe('signMultiple', () => {
    it('should sign all waivers successfully', async () => {
      mock.onPost('/waivers/accept').reply(200, mockAcceptance);
      const result = await service.signMultiple({
        waivers: [{ template_id: 'tpl-1' }, { template_id: 'tpl-2' }],
        signer_name: 'John Doe',
      });
      expect(result.success).toBe(true);
      expect(result.signed_count).toBe(2);
      expect(result.failed_count).toBe(0);
    });

    it('should handle partial failures', async () => {
      mock.onPost('/waivers/accept')
        .replyOnce(200, mockAcceptance)
        .replyOnce(400, { message: 'Error' });
      const result = await service.signMultiple({
        waivers: [{ template_id: 'tpl-1' }, { template_id: 'tpl-2' }],
        signer_name: 'John Doe',
      });
      expect(result.success).toBe(false);
      expect(result.signed_count).toBe(1);
      expect(result.failed_count).toBe(1);
    });
  });

  describe('checkCompletionStatus', () => {
    it('should return all_signed true when no pending', async () => {
      mock.onGet('/waivers/pending').reply(200, { items: [], pending_count: 0, total: 0 });
      const result = await service.checkCompletionStatus();
      expect(result.all_signed).toBe(true);
      expect(result.pending_count).toBe(0);
    });

    it('should return all_signed false when pending exist', async () => {
      mock.onGet('/waivers/pending').reply(200, { items: [{}], pending_count: 2, total: 2 });
      const result = await service.checkCompletionStatus();
      expect(result.all_signed).toBe(false);
      expect(result.pending_count).toBe(2);
    });
  });

  // ============== Admin Reporting ==============

  describe('getAcceptances', () => {
    it('should return all acceptances (admin)', async () => {
      mock.onGet('/waivers/admin/acceptances').reply(200, { items: [mockAcceptance], total: 1 });
      const result = await service.getAcceptances({ template_id: 'tpl-1' });
      expect(result.items.length).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return stats for a template', async () => {
      mock.onGet('/waivers/admin/acceptances').reply(200, { items: [mockAcceptance], total: 1 });
      const result = await service.getStats('tpl-1');
      expect(result.total_acceptances).toBe(1);
    });
  });
});
