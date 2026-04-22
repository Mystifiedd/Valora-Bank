export default function TableCard({
  eyebrow,
  title,
  description,
  actions,
  children,
  footer,
  className,
  responsive = true
}) {
  const combinedClassName = ['table-card', className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      {(eyebrow || title || actions || description) && (
        <div className="table-card__header">
          <div>
            {eyebrow && <p className="heading-eyebrow mb-1">{eyebrow}</p>}
            {title && <h2 className="section-title mb-0">{title}</h2>}
            {description && <p className="text-muted mb-0">{description}</p>}
          </div>
          {actions && <div className="table-card__controls">{actions}</div>}
        </div>
      )}
      {responsive ? (
        <div className="table-responsive">
          {children}
        </div>
      ) : (
        children
      )}
      {footer && <div className="table-card__footer">{footer}</div>}
    </div>
  );
}
