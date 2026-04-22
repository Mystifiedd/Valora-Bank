import { useState, useCallback } from 'react';
import api from '../api/axios';
import { extractApiError } from '../utils/format';

/**
 * Hook for API form submissions (POST, PATCH, PUT, DELETE).
 *
 * Returns { submit, submitting, error, success, resetStatus }
 */
export default function useFormSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = useCallback(async ({ method = 'post', url, data, successMessage }) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api[method](url, data);
      if (successMessage) setSuccess(successMessage);
      return res.data;
    } catch (err) {
      const msg = extractApiError(err);
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return { submit, submitting, error, success, setError, setSuccess, resetStatus };
}
