/**
 * Marketing Service
 * Contacts import/filter/CRUD, saved segments, compose & send, history.
 */

import apiClient from "../client";
import { API_ENDPOINTS } from "../../constants/api.constants";

const marketingService = {
  // ---- Contacts ----------------------------------------------------------
  /** Import a CSV/XLSX file of contacts. */
  async upload(file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post(API_ENDPOINTS.MARKETING.UPLOAD, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** Get the filter schema (fields + operators) that drives the filter UI. */
  async getFilterSchema() {
    const { data } = await apiClient.get(API_ENDPOINTS.MARKETING.FILTER_SCHEMA);
    return data;
  },

  /**
   * List contacts.
   * @param {Object} opts - { filters: string[], page, per_page }
   * `filters` is an array of "field:op:value" strings.
   */
  async getRecords({ filters = [], page = 1, per_page = 50 } = {}) {
    const params = new URLSearchParams();
    filters.forEach((f) => params.append("filter", f));
    params.append("page", page);
    params.append("per_page", per_page);
    const { data } = await apiClient.get(
      `${API_ENDPOINTS.MARKETING.RECORDS}?${params.toString()}`
    );
    return data;
  },

  async updateContact(id, payload) {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.MARKETING.UPDATE_CONTACT(id),
      payload
    );
    return data;
  },

  async deleteContact(id) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.MARKETING.DELETE_CONTACT(id)
    );
    return data;
  },

  /** Bulk delete by ids or by filters (send one or the other). */
  async bulkDelete({ ids, filters }) {
    const body = {};
    if (ids) body.ids = ids;
    if (filters) body.filters = filters;
    const { data } = await apiClient.post(
      API_ENDPOINTS.MARKETING.BULK_DELETE,
      body
    );
    return data;
  },

  async getDuplicates() {
    const { data } = await apiClient.get(API_ENDPOINTS.MARKETING.DUPLICATES);
    return data;
  },

  // ---- Segments ----------------------------------------------------------
  async getSegments() {
    const { data } = await apiClient.get(API_ENDPOINTS.MARKETING.SEGMENTS);
    return data;
  },

  async createSegment({ name, filters }) {
    const { data } = await apiClient.post(API_ENDPOINTS.MARKETING.SEGMENTS, {
      name,
      filters,
    });
    return data;
  },

  async updateSegment(id, payload) {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.MARKETING.SEGMENT_BY_ID(id),
      payload
    );
    return data;
  },

  async deleteSegment(id) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.MARKETING.SEGMENT_BY_ID(id)
    );
    return data;
  },

  // ---- Send --------------------------------------------------------------
  /** Live count of eligible recipients for a segment or raw filter specs. */
  async previewCount({ segment_id, filters }) {
    const body = {};
    if (segment_id) body.segment_id = segment_id;
    if (filters) body.filters = filters;
    const { data } = await apiClient.post(
      API_ENDPOINTS.MARKETING.PREVIEW_COUNT,
      body
    );
    return data;
  },

  /**
   * Compose + send.
   * @param {Object} opts - { subject, html_body, segment_id?, filters?: string[],
   *   attachments?: File[], inlineImages?: File[], inlineImageIds?: string[] }
   */
  async send({
    subject,
    html_body,
    segment_id,
    filters = [],
    attachments = [],
    inlineImages = [],
    inlineImageIds = [],
  }) {
    const form = new FormData();
    form.append("subject", subject);
    form.append("html_body", html_body);
    if (segment_id) form.append("segment_id", segment_id);
    filters.forEach((f) => form.append("filter", f));
    attachments.forEach((f) => form.append("attachments", f));
    inlineImages.forEach((f) => form.append("inline_images", f));
    if (inlineImageIds.length)
      form.append("inline_image_ids", JSON.stringify(inlineImageIds));
    const { data } = await apiClient.post(API_ENDPOINTS.MARKETING.SEND, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async getSends({ page = 1, per_page = 50 } = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.MARKETING.SENDS, {
      params: { page, per_page },
    });
    return data;
  },

  async getSend(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.MARKETING.SEND_BY_ID(id));
    return data;
  },

  // ---- Import history ----------------------------------------------------
  async getOperations({ operation_type = "upload", page = 1, per_page = 50 } = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.MARKETING.OPERATIONS, {
      params: { operation_type, page, per_page },
    });
    return data;
  },

  /** Download the rejected-row error report for an upload as a CSV blob. */
  async downloadOperationErrors(id) {
    const response = await apiClient.get(
      API_ENDPOINTS.MARKETING.OPERATION_ERRORS(id),
      { responseType: "blob" }
    );
    return response.data;
  },
};

export default marketingService;
