/**
 * A standard empty-state row for data tables.
 */
export default function EmptyRow({ colSpan, message = 'No data found.' }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-muted"
        style={{ textAlign: 'center', padding: 'var(--space-5) var(--space-3)' }}
      >
        {message}
      </td>
    </tr>
  );
}
