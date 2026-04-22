/**
 * A standard "Active / Inactive" badge for boolean is_active fields.
 */
export default function ActiveBadge({ isActive }) {
  return (
    <span className={`badge badge--${isActive ? 'success' : 'danger'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
