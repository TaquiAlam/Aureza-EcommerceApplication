/**
 * Centralized Error Utility Functions
 * 
 * Provides consistent error extraction, classification, and handling
 * across the entire application (Auth, Products, Cart, Address, Orders, etc.)
 */
import toast from 'react-hot-toast';

/**
 * Extract a user-friendly error message from an Axios error or generic Error.
 * Handles Spring Boot validation errors, generic API messages, network errors, and HTML fallback.
 *
 * @param {Error} error - The caught error object
 * @param {string} [fallbackMessage='Something went wrong'] - Default message if nothing can be extracted
 * @returns {string} A user-friendly error message
 */
export function extractApiError(error, fallbackMessage = 'Something went wrong') {
  if (!error) return fallbackMessage;

  // Axios error with response
  if (error.response) {
    const { data, status } = error.response;

    // HTML fallback detection (backend returned SPA HTML instead of JSON)
    if (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE')) {
      return 'Unable to connect to server. Please try again later.';
    }

    // Spring Boot validation errors (MethodArgumentNotValidException)
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.defaultMessage || e.message).join('. ');
    }

    // Standard API error message
    if (data?.message) {
      return data.message;
    }

    // Status-based fallback messages
    switch (status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Please sign in to continue.';
      case 403: return 'You don\'t have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'This action conflicts with existing data.';
      case 413: return 'The uploaded file is too large.';
      case 422: return 'The provided data is invalid.';
      case 429: return 'Too many requests. Please wait a moment.';
      case 500: return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504: return 'Service temporarily unavailable. Please try again later.';
      default: return fallbackMessage;
    }
  }

  // Network error (no response received)
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }

  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Request was made but no response received
  if (error.request && !error.response) {
    return 'No response from server. Please check your connection.';
  }

  // Generic Error with message
  if (error.message) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Check if the error is a network-level error (no connection to backend).
 */
export function isNetworkError(error) {
  if (!error) return false;
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') return true;
  if (error.request && !error.response) return true;
  if (typeof error.response?.data === 'string' && error.response.data.trim().startsWith('<!DOCTYPE')) return true;
  return false;
}

/**
 * Check if the error is an authentication error (401 or 403).
 */
export function isAuthError(error) {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Extract field-level validation errors from Spring Boot MethodArgumentNotValidException.
 * Returns an object like { fieldName: 'error message', ... }
 */
export function getValidationErrors(error) {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};

  return errors.reduce((acc, err) => {
    const field = err.field || err.objectName || 'general';
    acc[field] = err.defaultMessage || err.message || 'Invalid value';
    return acc;
  }, {});
}

/**
 * All-in-one error handler: extracts message, shows toast, and returns the message.
 *
 * @param {Error} error - The caught error object
 * @param {Object} [options] - Configuration options
 * @param {string} [options.fallbackMessage] - Custom fallback message
 * @param {boolean} [options.silent=false] - If true, don't show toast
 * @param {string} [options.toastId] - Custom toast ID to prevent duplicates
 * @returns {string} The extracted error message
 */
export function handleApiError(error, options = {}) {
  const { fallbackMessage, silent = false, toastId } = options;
  const message = extractApiError(error, fallbackMessage);

  if (!silent) {
    const toastOptions = toastId ? { id: toastId } : {};
    toast.error(message, toastOptions);
  }

  // Dev-mode logging
  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      message,
      status: error?.response?.status,
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.response?.data,
    });
  }

  return message;
}
