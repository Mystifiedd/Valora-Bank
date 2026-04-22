/**
 * Safely parse a value that may represent a boolean.
 * Accepts true/false, 'true'/'false', '1'/'0', 1/0.
 * Returns null for any unrecognised value.
 */
const parseBoolean = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return null;
};

module.exports = parseBoolean;
