/**
 * Unit Tests for src/api/client/query-client.ts
 * Tests the exported queryClient singleton
 */

import { QueryClient } from '@tanstack/react-query';

describe('query-client', () => {
  it('should export a queryClient that is an instance of QueryClient', () => {
    const { queryClient } = require('../../../api/client/query-client');
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it('should export a single instance (same reference on repeated imports)', () => {
    const mod1 = require('../../../api/client/query-client');
    const mod2 = require('../../../api/client/query-client');
    expect(mod1.queryClient).toBe(mod2.queryClient);
  });
});
