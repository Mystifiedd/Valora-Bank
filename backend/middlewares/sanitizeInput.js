const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;'
};

const ENTITY_RE = /[&<>"']/g;

const sanitizeString = (value) =>
  value
    .trim()
    .replace(/\0/g, '')
    .replace(ENTITY_RE, (ch) => HTML_ENTITIES[ch]);

const sanitizeValue = (payload) => {
  if (payload === null || payload === undefined) return payload;
  if (Array.isArray(payload)) return payload.map(sanitizeValue);
  if (typeof payload === 'string') return sanitizeString(payload);
  if (typeof payload === 'object') {
    const cleaned = {};
    for (const key of Object.keys(payload)) {
      cleaned[key] = sanitizeValue(payload[key]);
    }
    return cleaned;
  }
  return payload;
};

const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitizeInput;
