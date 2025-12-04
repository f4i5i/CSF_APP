/**
 * TanStack Query Client Instance
 * Single source of truth for React Query configuration
 */

import { createQueryClient } from '../config/query.config';

/**
 * Global query client instance
 * Import this in your app root and provider
 */
export const queryClient = createQueryClient();
