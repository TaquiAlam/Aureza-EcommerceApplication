import { useState, useCallback } from 'react';
import { extractApiError, getValidationErrors, handleApiError } from '../utils/errorUtils';

/**
 * useApiError — React hook for centralized API error handling.
 *
 * Provides:
 * - `error`       — The current error message string (or null)
 * - `fieldErrors` — Object of field-level validation errors { fieldName: 'message' }
 * - `handleError` — Call this in catch blocks to extract + toast + set local state
 * - `clearError`  — Reset error state (e.g., when user starts typing again)
 *
 * Usage:
 *   const { error, fieldErrors, handleError, clearError } = useApiError();
 *
 *   try {
 *     await someApiCall();
 *   } catch (err) {
 *     handleError(err, 'Failed to load data');
 *   }
 */
export function useApiError() {
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleError = useCallback((err, fallbackMessage, options = {}) => {
    const message = handleApiError(err, { fallbackMessage, ...options });
    setError(message);
    setFieldErrors(getValidationErrors(err));
    return message;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return { error, fieldErrors, handleError, clearError };
}
