import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, createUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { PageSpinner } from '../components/common/Spinner';
import { formatDate, getInitials, getAvatarColor } from '../utils/helpers';

const ROLES = ['Admin', 'QA Lead', 'Tester'];

const roleBadge = {
  'Admin': 'bg-purple-100 text-purple-700 border border-purple-200',
  'QA Lead': 'bg-blue-100 text-blue-700 border border-blue-200',
  'Tester': 'bg-green-100 text-green-700 border border-green-200'
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [createModal, setCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'Tester' });

  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.users);
    } catch {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await updateUserRole(editModal.user._id, selectedRole);
      addToast('User role updated', 'success');
      setEditModal({ open: false, user: null });
      loadUsers();
    } catch {
      addToast('Failed to update role', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser(createForm);
      addToast('User created successfully', 'success');
      setCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'Tester' });
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openRoleEdit = (user) => {
    setSelectedRole(user.role);
    setEditModal({ open: true, user });
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    leads: users.filter(u => u.role === 'QA Lead').length,
    testers: users.filter(u => u.role === 'Tester').length
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'bg-slate-100 text-slate-600' },
          { label: 'Admins', value: stats.admins, color: 'bg-purple-100 text-purple-600' },
          { label: 'QA Leads', value: stats.leads, color: 'bg-blue-100 text-blue-600' },
          { label: 'Testers', value: stats.testers, color: 'bg-green-100 text-green-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stat.color}`}>users</span>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Team Members</h3>
          {isAdmin && (
            <button onClick={() => setCreateModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          )}
        </div>

        {users.length === 0 ? (
          <EmptyState title="No users found" description="No team members have been added yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  {isAdmin && <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getAvatarColor(user.name)}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        {user._id === currentUser?._id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadge[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isActive ? 'text-green-700' : 'text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-right">
                        {user._id !== currentUser?._id && (
                          <button
                            onClick={() => openRoleEdit(user)}
                            className="text-xs px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                          >
                            Change Role
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, user: null })} title="Update User Role" size="sm">
        {editModal.user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(editModal.user.name)}`}>
                {getInitials(editModal.user.name)}
              </div>
              <div>
                <p className="font-medium text-slate-800">{editModal.user.name}</p>
                <p className="text-xs text-slate-500">{editModal.user.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Select Role</label>
              <div className="space-y-2">
                {ROLES.map(role => (
                  <label key={role} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === role ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} className="text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{role}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[role]}`}>{role}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditModal({ open: false, user: null })} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
              <button onClick={handleRoleUpdate} disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Add New User" size="sm">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Full Name *</label>
            <input value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Smith" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Email *</label>
            <input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@company.com" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Password *</label>
            <input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Role</label>
            <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setCreateModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;