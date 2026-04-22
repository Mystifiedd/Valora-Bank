export default function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert-banner alert-banner--${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-banner__close" onClick={onClose} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
