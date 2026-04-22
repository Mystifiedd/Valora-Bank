const { randomInt } = require('crypto');

/**
 * Generate a cryptographically-secure random numeric string of the given length.
 */
const secureRandomDigits = (length) => {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += randomInt(0, 10).toString();
  }
  return result;
};

/**
 * Generate a unique reference string with the given prefix.
 * Format: PREFIX-TIMESTAMP-RANDOM6
 */
const generateReference = (prefix) => {
  const randomPart = secureRandomDigits(6);
  return `${prefix}-${Date.now()}-${randomPart}`;
};

module.exports = {
  secureRandomDigits,
  generateReference
};
