const STATUS_TONES = {
  active: 'success',
  inactive: 'secondary',
  archived: 'secondary',
  frozen: 'warning',
  closed: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  verified: 'success',
  open: 'info',
  in_progress: 'primary',
  resolved: 'success',
  escalated: 'danger',
  credit: 'success',
  debit: 'danger'
};

const VALID_TONES = new Set(['success', 'warning', 'danger', 'info', 'neutral', 'primary', 'secondary']);

export default function StatusBadge({ status, colorMap }) {
  const map = colorMap || STATUS_TONES;
  const raw = typeof status === 'string' ? status : '';
  const key = raw.toLowerCase().replace(/\s+/g, '_');
  const tone = VALID_TONES.has(map[key]) ? map[key] : 'neutral';
  const display = raw ? raw.replace(/_/g, ' ') : '—';

  return (
    <span className={`status-chip status-chip--${tone}`}>
      {display}
    </span>
  );
}
