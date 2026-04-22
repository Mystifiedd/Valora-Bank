import { useEffect } from 'react';

export default function Modal({ show, title, onClose, size, children, footer }) {
  useEffect(() => {
    if (show) {
      document.body.setAttribute('data-no-scroll', '');
    } else {
      document.body.removeAttribute('data-no-scroll');
    }
    return () => document.body.removeAttribute('data-no-scroll');
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container" onClick={onClose}>
        <div
          className={`modal-box${size === 'lg' ? ' modal-box--lg' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-box__header">
            <h3 className="modal-box__title">{title}</h3>
            <button type="button" className="modal-box__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="modal-box__body">{children}</div>
          {footer && <div className="modal-box__footer">{footer}</div>}
        </div>
      </div>
    </>
  );
}
