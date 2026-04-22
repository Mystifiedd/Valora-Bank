/**
 * Format a number as Nepali Rupees (Rs.) currency.
 */
export const formatCurrency = (value) =>
  Number(value).toLocaleString('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

/**
 * Format an ISO date string for display.
 * Uses the user's locale for dates, includes time by default.
 */
export const formatDate = (isoString, { includeTime = true } = {}) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
};

/**
 * Extract a user-friendly error message from an Axios error.
 */
export const extractApiError = (err, fallback = 'Something went wrong') => {
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (err?.response?.data?.error && typeof err.response.data.error === 'string') return err.response.data.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return fallback;
};

/**
 * Mask a sensitive string, keeping only the last N characters visible.
 */
export const maskSensitive = (value, visibleChars = 4) => {
  if (!value || value.length <= visibleChars) return value;
  return '•'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
};

/**
 * Map a transaction type to UI-friendly metadata.
 */
export const getTransactionTone = (type) => {
  const normalised = (type || '').toString().trim().toLowerCase();

  if (normalised === 'credit') {
    return { tone: 'success', label: 'Credit', sign: '+' };
  }

  if (normalised === 'debit') {
    return { tone: 'danger', label: 'Debit', sign: '-' };
  }

  const raw = type ? String(type) : '—';
  const label = raw === '—' ? raw : raw.charAt(0).toUpperCase() + raw.slice(1);
  return { tone: '', label, sign: '' };
};
