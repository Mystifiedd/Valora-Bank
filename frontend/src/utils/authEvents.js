const AUTH_EVENT = 'auth:event';

export const emitAuthEvent = (type, detail = {}) => {
  window.dispatchEvent(
    new CustomEvent(AUTH_EVENT, {
      detail: { type, ...detail }
    })
  );
};

export const onAuthEvent = (handler) => {
  const listener = (event) => handler(event.detail || {});
  window.addEventListener(AUTH_EVENT, listener);
  return () => window.removeEventListener(AUTH_EVENT, listener);
};
