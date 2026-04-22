const decodePayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export const getTokenExpiry = (token) => {
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
};

export const isTokenExpired = (token, skewSeconds = 30) => {
  if (!token) return true;
  const exp = getTokenExpiry(token);
  if (!exp) return true; // treat unreadable tokens as expired (fail-safe)
  return Date.now() >= exp - skewSeconds * 1000;
};
