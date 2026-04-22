import { useState, useCallback, useEffect, useRef } from 'react';
import api from '../api/axios';
import { extractApiError } from '../utils/format';
import { PAGE_SIZE } from '../utils/constants';

/**
 * Generic hook for paginated GET requests with filters.
 *
 * @param {string} url        - API endpoint (e.g. '/accounts')
 * @param {object} options
 * @param {object} options.params      - Extra query parameters / filters
 * @param {number} options.pageSize    - Items per page (default PAGE_SIZE)
 * @param {boolean} options.immediate  - Fetch on mount (default true)
 * @param {string} options.dataKey     - Key in response containing rows (auto-detected if omitted)
 *
 * Returns { items, total, page, pageSize, loading, error, setPage, refresh }
 */
export default function usePaginatedFetch(url, {
  params = {},
  pageSize: customPageSize,
  immediate = true,
  dataKey
} = {}) {
  const pageSize = customPageSize || PAGE_SIZE;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  const fetch = useCallback(async (targetPage) => {
    // Abort any in-flight request
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError('');
    try {
      const res = await api.get(url, {
        params: { ...params, page: targetPage, page_size: pageSize },
        signal: controller.signal
      });

      // Auto-detect the data array key if not supplied
      const key =
        dataKey ||
        Object.keys(res.data).find(
          (k) => Array.isArray(res.data[k])
        );

      setItems(key ? res.data[key] : []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(extractApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params), pageSize, dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch whenever page changes (or on mount if immediate)
  useEffect(() => {
    if (immediate) fetch(page);
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [page, fetch, immediate]);

  const refresh = useCallback(() => fetch(page), [fetch, page]);

  return { items, total, page, pageSize, loading, error, setError, setPage, refresh };
}
