import React, { useState, useEffect, useCallback } from 'react';
import { getBugs, createBug, updateBug, deleteBug } from '../services/bugService';
import { getUsers } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { PageSpinner } from '../components/common/Spinner';
import { formatDate, getStatusStyle, getPriorityStyle, getSeverityStyle, getInitials, getAvatarColor, truncate } from '../utils/helpers';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Fixed', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITY_OPTIONS = ['Minor', 'Major', 'Blocker'];

const defaultForm = {
  title: '', description: '', status: 'Open', priority: 'Medium', severity: 'Minor',
  assignedTo: '', project: '', tags: '', stepsToReproduce: '', expectedResult: '', actualResult: '', environment: ''
};

const BugForm = ({ form, setForm, users, onSubmit, onClose, loading, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Title *</label>
      <input
        value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Brief description of the bug" required
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Description *</label>
      <textarea
        value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Detailed description" required
      />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Status', field: 'status', options: STATUS_OPTIONS },
        { label: 'Priority', field: 'priority', options: PRIORITY_OPTIONS },
        { label: 'Severity', field: 'severity', options: SEVERITY_OPTIONS }
      ].map(({ label, field, options }) => (
        <div key={field}>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">{label}</label>
          <select
            value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Assign To</label>
        <select
          value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Unassigned</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Project</label>
        <input
          value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Project name"
        />
      </div>
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Steps to Reproduce</label>
      <textarea
        value={form.stepsToReproduce} onChange={e => setForm(p => ({ ...p, stepsToReproduce: e.target.value }))}
        rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="1. Go to...\n2. Click on..."
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Expected Result</label>
        <input
          value={form.expectedResult} onChange={e => setForm(p => ({ ...p, expectedResult: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What should happen"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Actual Result</label>
        <input
          value={form.actualResult} onChange={e => setForm(p => ({ ...p, actualResult: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What actually happens"
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Environment</label>
        <input
          value={form.environment} onChange={e => setForm(p => ({ ...p, environment: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Chrome 120, Windows 11"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Tags (comma-separated)</label>
        <input
          value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="login, ui, mobile"
        />
      </div>
    </div>
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
        Cancel
      </button>
      <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
        {loading ? 'Saving...' : (isEdit ? 'Update Bug' : 'Create Bug')}
      </button>
    </div>
  </form>
);

const BugManagement = () => {
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '', severity: '', search: '' });
  const [modal, setModal] = useState({ open: false, bug: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bugId: null });
  const [form, setForm] = useState(defaultForm);
  const { addToast } = useToast();
  const { user } = useAuth();
  const LIMIT = 10;

  const loadBugs = useCallback(async (page = 1) => {
    try {
      const params = { page, limit: LIMIT, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await getBugs(params);
      setBugs(res.data.bugs);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setCurrentPage(page);
    } catch {
      addToast('Failed to load bugs', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    loadBugs(1);
    getUsers().then(res => setUsers(res.data.users)).catch(() => {});
  }, [loadBugs]);

  const openCreate = () => {
    setForm(defaultForm);
    setModal({ open: true, bug: null });
  };

  const openEdit = (bug) => {
    setForm({
      title: bug.title, description: bug.description, status: bug.status,
      priority: bug.priority, severity: bug.severity,
      assignedTo: bug.assignedTo?._id || '',
      project: bug.project || '', tags: bug.tags?.join(', ') || '',
      stepsToReproduce: bug.stepsToReproduce || '',
      expectedResult: bug.expectedResult || '',
      actualResult: bug.actualResult || '',
      environment: bug.environment || ''
    });
    setModal({ open: true, bug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignedTo: form.assignedTo || null
      };
      if (modal.bug) {
        await updateBug(modal.bug._id, payload);
        addToast('Bug updated successfully', 'success');
      } else {
        await createBug(payload);
        addToast('Bug created successfully', 'success');
      }
      setModal({ open: false, bug: null });
      loadBugs(currentPage);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save bug', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteBug(deleteDialog.bugId);
      addToast('Bug deleted', 'success');
      setDeleteDialog({ open: false, bugId: null });
      loadBugs(currentPage);
    } catch {
      addToast('Failed to delete bug', 'error');
    } finally {
      setSaving(false);
    }
  };

  const canDelete = user?.role === 'Admin' || user?.role === 'QA Lead';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{total} bug{total !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bug
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Search bugs..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {[
            { label: 'Status', field: 'status', options: STATUS_OPTIONS },
            { label: 'Priority', field: 'priority', options: PRIORITY_OPTIONS },
            { label: 'Severity', field: 'severity', options: SEVERITY_OPTIONS }
          ].map(({ label, field, options }) => (
            <select
              key={field}
              value={filters[field]}
              onChange={e => setFilters(p => ({ ...p, [field]: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {label}</option>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ status: '', priority: '', severity: '', search: '' })} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <PageSpinner /> : bugs.length === 0 ? (
          <EmptyState
            title="No bugs found"
            description="No bugs match your current filters. Try adjusting your search or create a new bug."
            action={<button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Create First Bug</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bug</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Severity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Assigned To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Created</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bugs.map(bug => (
                    <tr key={bug._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{truncate(bug.title, 60)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{bug.project || 'General'}</div>
                        <div className="flex gap-1.5 mt-1 md:hidden">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getStatusStyle(bug.status)}`}>{bug.status}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getPriorityStyle(bug.priority)}`}>{bug.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(bug.status)}`}>{bug.status}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityStyle(bug.priority)}`}>{bug.priority}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${getSeverityStyle(bug.severity)}`}>{bug.severity}</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {bug.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(bug.assignedTo.name)}`}>
                              {getInitials(bug.assignedTo.name)}
                            </div>
                            <span className="text-slate-700 text-xs">{bug.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-500">{formatDate(bug.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(bug)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {canDelete && (
                            <button onClick={() => setDeleteDialog({ open: true, bugId: bug._id })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={pages} onPageChange={loadBugs} total={total} limit={LIMIT} />
          </>
        )}
      </div>

      {/* Bug Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, bug: null })} title={modal.bug ? 'Edit Bug' : 'Create New Bug'} size="lg">
        <BugForm form={form} setForm={setForm} users={users} onSubmit={handleSubmit} onClose={() => setModal({ open: false, bug: null })} loading={saving} isEdit={!!modal.bug} />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, bugId: null })}
        onConfirm={handleDelete}
        title="Delete Bug"
        message="Are you sure you want to delete this bug? This action cannot be undone."
        isLoading={saving}
      />
    </div>
  );
};

export default BugManagement;