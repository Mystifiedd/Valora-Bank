/**
 * Confirmation modal for destructive or important actions.
 */
import Modal from './Modal';

export default function ConfirmModal({ show, title, message, confirmText = 'Confirm', confirmVariant = 'primary', loading, onConfirm, onClose }) {
  const variantClass = {
    primary: 'button-primary',
    success: 'button-success',
    danger: 'button-danger',
    warning: 'button-warning',
  }[confirmVariant] || 'button-primary';

  return (
    <Modal
      show={show}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="button button-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={`button ${variantClass}`} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner spinner--sm" /> : confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
}
