import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server for Node.js environment (Jest tests)
 * This server intercepts HTTP requests during unit and integration tests
 */
export const server = setupServer(...handlers);
