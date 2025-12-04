/**
 * useMutation Hook
 * Generic mutation hook for create, update, delete operations with loading and error states
 *
 * @example
 * const { mutate, loading, error, data } = useMutation(
 *   childrenService.create,
 *   {
 *     onSuccess: (data) => {
 *       toast.success('Child created!');
 *       refetchChildren();
 *     },
 *     onError: (error) => toast.error(error)
 *   }
 * );
 *
 * // Use it
 * await mutate({ first_name: 'John', last_name: 'Doe' });
 */

import { useState, useCallback } from 'react';
import { getErrorMessage } from '../lib/errorHandler';

export const useMutation = (mutationFunction, options = {}) => {
  const {
    onSuccess = null,    // Callback on success
    onError = null,      // Callback on error
    onSettled = null,    // Callback when mutation settles (success or error)
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mutation function
  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await mutationFunction(...args);
        setData(result);
        setLoading(false);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }

        // Call settled callback
        if (onSettled) {
          onSettled(result, null);
        }

        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setLoading(false);

        // Call error callback if provided
        if (onError) {
          onError(errorMessage, err);
        }

        // Call settled callback
        if (onSettled) {
          onSettled(null, errorMessage);
        }

        throw err;
      }
    },
    [mutationFunction, onSuccess, onError, onSettled]
  );

  // Reset mutation state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset,
    isLoading: loading,
    isError: !!error,
    isSuccess: !!data && !error,
  };
};

export default useMutation;
