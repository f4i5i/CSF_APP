/**
 * useApi Hook
 * Generic data fetching hook with loading, error, and caching support
 *
 * @example
 * const { data, loading, error, refetch } = useApi(
 *   childrenService.getMy,
 *   { autoFetch: true }
 * );
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getErrorMessage } from '../lib/errorHandler';

export const useApi = (apiFunction, options = {}) => {
  const {
    autoFetch = true,           // Automatically fetch on mount
    dependencies = [],           // Refetch when these change
    onSuccess = null,            // Callback on success
    onError = null,              // Callback on error
    initialData = null,          // Initial data value
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Fetch function
  const fetchData = useCallback(
    async (...args) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        console.log('useApi - API function result:', result);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);

          // Call success callback if provided
          if (onSuccess) {
            onSuccess(result);
          }
        }

        return result;
      } catch (err) {
        // Ignore abort errors
        if (err.name === 'AbortError') {
          return;
        }

        if (isMountedRef.current) {
          const errorMessage = getErrorMessage(err);
          setError(errorMessage);
          setLoading(false);

          // Call error callback if provided
          if (onError) {
            onError(errorMessage);
          }
        }

        throw err;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  // Refetch function (manual trigger)
  const refetch = useCallback(
    (...args) => {
      return fetchData(...args);
    },
    [fetchData]
  );

  // Track if component is mounted (only set to false on actual unmount)
  useEffect(() => {
    isMountedRef.current = true;

    // Cleanup on unmount only
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty deps - only runs on mount/unmount

  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchData,
  };
};

export default useApi;
