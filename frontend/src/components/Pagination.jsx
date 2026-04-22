export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const range = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    range.push(i);
  }

  return (
    <nav className="pagination-bar">
      <span className="pagination-bar__info">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="pagination-bar__controls">
        <button
          className="pagination-bar__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        {range[0] > 1 && (
          <>
            <button className="pagination-bar__btn" onClick={() => onPageChange(1)}>1</button>
            {range[0] > 2 && <span className="pagination-bar__ellipsis">…</span>}
          </>
        )}
        {range.map((p) => (
          <button
            key={p}
            className={`pagination-bar__btn${p === page ? ' pagination-bar__btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        {range[range.length - 1] < totalPages && (
          <>
            {range[range.length - 1] < totalPages - 1 && <span className="pagination-bar__ellipsis">…</span>}
            <button className="pagination-bar__btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          className="pagination-bar__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </nav>
  );
}
