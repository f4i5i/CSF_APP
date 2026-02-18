/**
 * Unit Tests for src/api/config/query.config.ts
 * Tests defaultQueryOptions, createQueryClient, and REFETCH_INTERVALS
 */

import { QueryClient } from '@tanstack/react-query';
import {
  defaultQueryOptions,
  createQueryClient,
  REFETCH_INTERVALS,
} from '../../../api/config/query.config';

describe('query.config', () => {
  // =========================================================================
  // defaultQueryOptions.queries
  // =========================================================================
  describe('defaultQueryOptions.queries', () => {
    const queries = defaultQueryOptions.queries;

    it('should have staleTime of 1 minute (60000ms)', () => {
      expect(queries.staleTime).toBe(60 * 1000);
    });

    it('should have gcTime of 5 minutes (300000ms)', () => {
      expect(queries.gcTime).toBe(5 * 60 * 1000);
    });

    it('should refetch on window focus', () => {
      expect(queries.refetchOnWindowFocus).toBe(true);
    });

    it('should refetch on reconnect', () => {
      expect(queries.refetchOnReconnect).toBe(true);
    });

    it('should refetch on mount', () => {
      expect(queries.refetchOnMount).toBe(true);
    });

    describe('retry function', () => {
      const retry = queries.retry as (failureCount: number, error: any) => boolean;

      it('should not retry on 4xx client errors', () => {
        expect(retry(0, { status: 400 })).toBe(false);
        expect(retry(0, { status: 404 })).toBe(false);
        expect(retry(0, { status: 422 })).toBe(false);
        expect(retry(0, { status: 499 })).toBe(false);
      });

      it('should retry on 5xx server errors up to 3 times', () => {
        expect(retry(0, { status: 500 })).toBe(true);
        expect(retry(1, { status: 502 })).toBe(true);
        expect(retry(2, { status: 503 })).toBe(true);
        expect(retry(3, { status: 500 })).toBe(false);
      });

      it('should retry on unknown errors up to 3 times', () => {
        expect(retry(0, {})).toBe(true);
        expect(retry(2, {})).toBe(true);
        expect(retry(3, {})).toBe(false);
      });
    });

    describe('retryDelay function', () => {
      const retryDelay = queries.retryDelay as (attemptIndex: number) => number;

      it('should use exponential backoff starting at 1000ms', () => {
        expect(retryDelay(0)).toBe(1000);   // 1s
        expect(retryDelay(1)).toBe(2000);   // 2s
        expect(retryDelay(2)).toBe(4000);   // 4s
        expect(retryDelay(3)).toBe(8000);   // 8s
      });

      it('should cap delay at 30000ms', () => {
        expect(retryDelay(10)).toBe(30000);
        expect(retryDelay(20)).toBe(30000);
      });
    });
  });

  // =========================================================================
  // defaultQueryOptions.mutations
  // =========================================================================
  describe('defaultQueryOptions.mutations', () => {
    const mutations = defaultQueryOptions.mutations;

    describe('retry function', () => {
      const retry = mutations.retry as (failureCount: number, error: any) => boolean;

      it('should retry once on network errors', () => {
        expect(retry(0, { code: 'NETWORK_ERROR' })).toBe(true);
      });

      it('should not retry more than once on network errors', () => {
        expect(retry(1, { code: 'NETWORK_ERROR' })).toBe(false);
      });

      it('should not retry on non-network errors', () => {
        expect(retry(0, { code: 'VALIDATION_ERROR' })).toBe(false);
        expect(retry(0, { status: 500 })).toBe(false);
        expect(retry(0, {})).toBe(false);
      });
    });
  });

  // =========================================================================
  // createQueryClient
  // =========================================================================
  describe('createQueryClient', () => {
    it('should return a QueryClient instance', () => {
      const qc = createQueryClient();
      expect(qc).toBeInstanceOf(QueryClient);
    });

    it('should return a new instance each time', () => {
      const qc1 = createQueryClient();
      const qc2 = createQueryClient();
      expect(qc1).not.toBe(qc2);
    });
  });

  // =========================================================================
  // REFETCH_INTERVALS
  // =========================================================================
  describe('REFETCH_INTERVALS', () => {
    it('should have CHECK_IN_STATUS of 30 seconds', () => {
      expect(REFETCH_INTERVALS.CHECK_IN_STATUS).toBe(30 * 1000);
    });

    it('should have ATTENDANCE of 1 minute', () => {
      expect(REFETCH_INTERVALS.ATTENDANCE).toBe(60 * 1000);
    });

    it('should have ADMIN_METRICS of 2 minutes', () => {
      expect(REFETCH_INTERVALS.ADMIN_METRICS).toBe(2 * 60 * 1000);
    });

    it('should have CLASS_CAPACITY of 1 minute', () => {
      expect(REFETCH_INTERVALS.CLASS_CAPACITY).toBe(60 * 1000);
    });
  });
});
