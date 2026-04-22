const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Normalise page / pageSize values coming from query params.
 * Returns { page, pageSize, offset } with safe defaults.
 */
const normalisePagination = (rawPage, rawPageSize) => {
  const page = Math.max(Number(rawPage) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number(rawPageSize) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
};

/**
 * Build a standard paginated response envelope.
 */
const paginatedResponse = (key, rows, { page, pageSize, total }) => ({
  [key]: rows,
  page,
  page_size: pageSize,
  total: Number(total)
});

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  normalisePagination,
  paginatedResponse
};
