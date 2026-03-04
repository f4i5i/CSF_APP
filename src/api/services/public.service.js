/**
 * Public Service
 * Handles public (no-auth) API endpoints
 */

import axios from "axios";
import API_CONFIG from "../config";
import { API_ENDPOINTS } from "../../constants/api.constants";

// Separate axios instance without auth interceptors
const publicClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicService = {
  /**
   * Get public roster by share token (no auth required)
   * @param {string} shareToken - UUID share token
   * @returns {Promise<Object>} Public roster data
   */
  async getPublicRoster(shareToken) {
    const { data } = await publicClient.get(
      API_ENDPOINTS.PUBLIC.ROSTER(shareToken)
    );
    return data;
  },
};

export default publicService;
