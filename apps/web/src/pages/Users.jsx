import { useState, useEffect } from 'react';
import { apiFetch, displayName } from '../api';
import { useTranslation } from 'react-i18next';
import { Alert, PageHeader } from '../components/ui';

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState('');

  const { t } = useTranslation();

  async function loadUsers() {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function toggleSelected(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.length === users.length ? [] : users.map((u) => u.id)
    );
  }

  async function handleRoleChange(userId, newRole) {
    setError('');
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBlockSelected(shouldBlock) {
    setError('');
    try {
      await Promise.all(
        selectedIds.map((id) =>
          apiFetch(`/users/${id}/block`, {
            method: 'PUT',
            body: JSON.stringify({ isBlocked: shouldBlock }),
          })
        )
      );
      setSelectedIds([]);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSelected() {
    setError('');
    try {
      await Promise.all(
        selectedIds.map((id) => apiFetch(`/users/${id}`, { method: 'DELETE' }))
      );
      setSelectedIds([]);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader title={t('users.title')}>
        <button className="btn btn-secondary btn-sm" disabled={selectedIds.length === 0} onClick={() => handleBlockSelected(true)}>{t('users.block')}</button>
        <button className="btn btn-secondary btn-sm" disabled={selectedIds.length === 0} onClick={() => handleBlockSelected(false)}>{t('users.unblock')}</button>
        <button className="btn btn-secondary btn-sm text-danger" disabled={selectedIds.length === 0} onClick={handleDeleteSelected}>{t('users.delete')}</button>
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="surface overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  className="size-4 accent-accent"
                  aria-label="Select all"
                  checked={selectedIds.length === users.length && users.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>{t('users.colName')}</th>
              <th>{t('users.colEmail')}</th>
              <th>{t('users.colRole')}</th>
              <th>{t('users.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <input type="checkbox" className="size-4 accent-accent" checked={selectedIds.includes(u.id)} onChange={() => toggleSelected(u.id)} />
                </td>
                <td className="font-medium">{displayName(u)}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <select className="input input-sm w-36" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                    <option value="candidate">{t('users.candidate')}</option>
                    <option value="recruiter">{t('users.recruiter')}</option>
                    <option value="admin">{t('users.admin')}</option>
                  </select>
                </td>
                <td>
                  <span className={`chip ${u.isBlocked ? 'chip-danger' : 'chip-accent'}`}>
                    {u.isBlocked ? t('users.blocked') : t('users.active')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
