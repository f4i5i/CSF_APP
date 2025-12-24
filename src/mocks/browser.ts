import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW Worker for browser environment (development mode)
 * This worker intercepts HTTP requests in the browser for development/debugging
 */
export const worker = setupWorker(...handlers);
