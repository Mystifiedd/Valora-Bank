import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import ActiveBadge from '../../components/ActiveBadge';
import EmptyRow from '../../components/EmptyRow';
import ConfirmModal from '../../components/ConfirmModal';
import { extractApiError } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';

const EMPTY_FORM = { first_name: '', last_name: '', email: '', phone: '', password: '', branch_id: '' };

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit modal
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({ branch_id: '', is_active: 1 });
  const [acting, setActing] = useState(false);

  // Add employee modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [adding, setAdding] = useState(false);

  // Remove confirm
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Role change modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [roleId, setRoleId] = useState('');
  const [changingRole, setChangingRole] = useState(false);
  const [roles, setRoles] = useState([]);

  const fetchEmployees = useCallback((p) => {
    setLoading(true);
    api.get('/admin/employees', { params: { page: p, page_size: PAGE_SIZE } })
      .then((res) => { setEmployees(res.data.employees || []); setTotal(res.data.total || 0); })
      .catch((err) => setError(extractApiError(err, 'Failed to load employees')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEmployees(page); }, [page, fetchEmployees]);

  // Fetch roles once for role-change dropdown
  useEffect(() => {
    api.get('/admin/users', { params: { page: 1, page_size: 1 } }).catch(() => {});
    // We hardcode the 3 known roles since there's no /roles endpoint
    setRoles([{ id: 1, name: 'Admin' }, { id: 2, name: 'Employee' }, { id: 3, name: 'Customer' }]);
  }, []);

  const openEdit = (emp) => {
    setSelected(emp);
    setEditForm({ branch_id: emp.branch_id || '', is_active: emp.is_active ? 1 : 0 });
    setShowModal(true);
    setSuccess('');
  };

  const saveEmployee = async (e) => {
    e.preventDefault();
    setActing(true);
    try {
      await api.patch(`/admin/employees/${selected.id}`, {
        branch_id: editForm.branch_id ? Number(editForm.branch_id) : undefined,
        is_active: Number(editForm.is_active),
      });
      setSuccess(`Employee #${selected.id} updated successfully!`);
      setShowModal(false);
      fetchEmployees(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to update employee'));
    } finally { setActing(false); }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const payload = { ...addForm };
      if (payload.branch_id) payload.branch_id = Number(payload.branch_id);
      else delete payload.branch_id;
      await api.post('/admin/employees', payload);
      setSuccess('Employee added successfully!');
      setShowAddModal(false);
      setAddForm({ ...EMPTY_FORM });
      fetchEmployees(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to add employee'));
    } finally { setAdding(false); }
  };

  const handleRemoveEmployee = async () => {
    setRemoving(true);
    try {
      await api.delete(`/admin/employees/${removeTarget.id}`);
      setSuccess(`Employee ${removeTarget.first_name} ${removeTarget.last_name} removed.`);
      setRemoveTarget(null);
      fetchEmployees(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to remove employee'));
    } finally { setRemoving(false); }
  };

  const openRoleModal = (emp) => {
    setRoleTarget(emp);
    setRoleId('');
    setShowRoleModal(true);
  };

  const handleChangeRole = async (e) => {
    e.preventDefault();
    setChangingRole(true);
    try {
      const res = await api.patch(`/admin/employees/${roleTarget.id}/role`, { role_id: Number(roleId) });
      setSuccess(`User #${roleTarget.id} role changed to ${res.data.role}.`);
      setShowRoleModal(false);
      fetchEmployees(page);
    } catch (err) {
      setError(extractApiError(err, 'Failed to change role'));
    } finally { setChangingRole(false); }
  };

  return (
    <div className="stack stack-lg">
      <div className="page-header">
        <h1 className="page-header__title">Manage Employees</h1>
        <button className="button button-primary" onClick={() => { setShowAddModal(true); setSuccess(''); }}>
          + Add Employee
        </button>
      </div>
      <Alert type="danger" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? <Spinner /> : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Branch</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <EmptyRow colSpan={7} message="No employees found." />
                ) : employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.branch_id || '-'}</td>
                    <td><ActiveBadge isActive={emp.is_active} /></td>
                    <td>
                      <div className="btn-cluster">
                        <button className="button button-outline button-sm" onClick={() => openEdit(emp)}>Edit</button>
                        <button className="button button-secondary button-sm" onClick={() => openRoleModal(emp)}>Role</button>
                        <button className="button button-danger button-sm" onClick={() => setRemoveTarget(emp)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      {/* Edit Employee Modal */}
      <Modal show={showModal} title={`Edit Employee #${selected?.id}`} onClose={() => setShowModal(false)}>
        <form onSubmit={saveEmployee} className="stack">
          <div className="form-field">
            <label>Branch ID</label>
            <input type="number" className="input" value={editForm.branch_id} onChange={(e) => setEditForm({ ...editForm, branch_id: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select className="input" value={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: Number(e.target.value) })}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="button button-primary" disabled={acting}>
              {acting ? <span className="spinner spinner--sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Employee Modal */}
      <Modal show={showAddModal} title="Add New Employee" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleAddEmployee} className="stack">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-field">
              <label>First Name</label>
              <input className="input" value={addForm.first_name} onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Last Name</label>
              <input className="input" value={addForm.last_name} onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })} required />
            </div>
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" className="input" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Phone</label>
            <input className="input" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" className="input" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required minLength={8} />
          </div>
          <div className="form-field">
            <label>Branch ID (optional)</label>
            <input type="number" className="input" value={addForm.branch_id} onChange={(e) => setAddForm({ ...addForm, branch_id: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="button button-primary" disabled={adding}>
              {adding ? <span className="spinner spinner--sm" /> : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal show={showRoleModal} title={`Change Role — ${roleTarget?.first_name} ${roleTarget?.last_name}`} onClose={() => setShowRoleModal(false)}>
        <form onSubmit={handleChangeRole} className="stack">
          <div className="form-field">
            <label>New Role</label>
            <select className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
              <option value="">Select role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="button button-warning" disabled={changingRole || !roleId}>
              {changingRole ? <span className="spinner spinner--sm" /> : 'Change Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirm */}
      <ConfirmModal
        show={!!removeTarget}
        title="Remove Employee"
        message={`Are you sure you want to remove ${removeTarget?.first_name} ${removeTarget?.last_name}? They will be deactivated and unassigned from all tickets.`}
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removing}
        onConfirm={handleRemoveEmployee}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
