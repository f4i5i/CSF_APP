/**
 * Email Templates Service — admin-authored reusable Mass Email templates.
 */
import apiClient from "../client";

const BASE = "/admin/email-templates";

const emailTemplatesService = {
  async list() {
    const { data } = await apiClient.get(BASE);
    return data;
  },
  async create({ name, subject, body_html }) {
    const { data } = await apiClient.post(BASE, { name, subject, body_html });
    return data;
  },
  async update(id, { name, subject, body_html }) {
    const { data } = await apiClient.put(`${BASE}/${id}`, {
      name,
      subject,
      body_html,
    });
    return data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`${BASE}/${id}`);
    return data;
  },
};

export default emailTemplatesService;
