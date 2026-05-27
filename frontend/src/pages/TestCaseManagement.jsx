import React, { useState, useEffect, useCallback } from 'react';
import {
  getTestSuites, createTestSuite, deleteTestSuite,
  getTestCases, createTestCase, updateTestCase, executeTestCase, deleteTestCase
} from '../services/testService';
import { getUsers } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { PageSpinner } from '../components/common/Spinner';
import { getStatusStyle, getInitials, getAvatarColor, formatDate } from '../utils/helpers';

const TEST_STATUS = ['Not Executed', 'Pass', 'Fail', 'Blocked'];
const TEST_PRIORITY = ['Low', 'Medium', 'High'];

const statusIcons = {
  'Pass': { icon: '✓', bg: 'bg-green-100', text: 'text-green-700' },
  'Fail': { icon: '✗', bg: 'bg-red-100', text: 'text-red-700' },
  'Blocked': { icon: '⊘', bg: 'bg-orange-100', text: 'text-orange-700' },
  'Not Executed': { icon: '○', bg: 'bg-gray-100', text: 'text-gray-500' }
};

const SuiteCard = ({ suite, isSelected, onClick, onDelete, canDelete }) => {
  const { counts } = suite;
  const passRate = counts.total > 0 ? Math.round((counts.pass / counts.total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate">{suite.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{suite.project}</p>
        </div>
        {canDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(suite._id); }}
            className="p-1 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-slate-500">{counts.total} tests</span>
        {counts.total > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${passRate}%` }} />
            </div>
            <span className="text-slate-500">{passRate}%</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {counts.pass > 0 && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{counts.pass}P</span>}
        {counts.fail > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{counts.fail}F</span>}
        {counts.blocked > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{counts.blocked}B</span>}
        {counts.notExecuted > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{counts.notExecuted}N</span>}
      </div>
    </div>
  );
};

const TestCaseManagement = () => {
  const [suites, setSuites] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tcLoading, setTcLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [suiteModal, setSuiteModal] = useState(false);
  const [suiteForm, setSuiteForm] = useState({ name: '', description: '', project: '' });

  const [tcModal, setTcModal] = useState({ open: false, tc: null });
  const [tcForm, setTcForm] = useState({ title: '', description: '', steps: '', expectedResult: '', priority: 'Medium', assignedTo: '' });

  const [executeModal, setExecuteModal] = useState({ open: false, tc: null });
  const [execForm, setExecForm] = useState({ status: 'Pass', executionComment: '' });

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: null });

  const { addToast } = useToast();
  const { user } = useAuth();
  const canDelete = user?.role === 'Admin' || user?.role === 'QA Lead';

  const loadSuites = useCallback(async () => {
    try {
      const res = await getTestSuites();
      setSuites(res.data.testSuites);
    } catch {
      addToast('Failed to load test suites', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const loadTestCases = useCallback(async (suiteId) => {
    setTcLoading(true);
    try {
      const res = await getTestCases({ suite: suiteId, limit: 100 });
      setTestCases(res.data.testCases);
    } catch {
      addToast('Failed to load test cases', 'error');
    } finally {
      setTcLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSuites();
    getUsers().then(res => setUsers(res.data.users)).catch(() => {});
  }, [loadSuites]);

  useEffect(() => {
    if (selectedSuite) loadTestCases(selectedSuite._id);
    else setTestCases([]);
  }, [selectedSuite, loadTestCases]);

  const handleCreateSuite = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTestSuite(suiteForm);
      addToast('Test suite created', 'success');
      setSuiteModal(false);
      setSuiteForm({ name: '', description: '', project: '' });
      loadSuites();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create suite', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSuite = async () => {
    setSaving(true);
    try {
      await deleteTestSuite(deleteDialog.id);
      addToast('Test suite deleted', 'success');
      if (selectedSuite?._id === deleteDialog.id) setSelectedSuite(null);
      setDeleteDialog({ open: false, id: null, type: null });
      loadSuites();
    } catch {
      addToast('Failed to delete suite', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openCreateTC = () => {
    setTcForm({ title: '', description: '', steps: '', expectedResult: '', priority: 'Medium', assignedTo: '' });
    setTcModal({ open: true, tc: null });
  };

  const openEditTC = (tc) => {
    setTcForm({
      title: tc.title, description: tc.description || '',
      steps: tc.steps?.join('\n') || '', expectedResult: tc.expectedResult || '',
      priority: tc.priority, assignedTo: tc.assignedTo?._id || ''
    });
    setTcModal({ open: true, tc });
  };

  const handleSaveTC = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...tcForm,
        steps: tcForm.steps ? tcForm.steps.split('\n').filter(s => s.trim()) : [],
        suite: selectedSuite._id,
        assignedTo: tcForm.assignedTo || null
      };
      if (tcModal.tc) {
        await updateTestCase(tcModal.tc._id, payload);
        addToast('Test case updated', 'success');
      } else {
        await createTestCase(payload);
        addToast('Test case created', 'success');
      }
      setTcModal({ open: false, tc: null });
      loadTestCases(selectedSuite._id);
      loadSuites();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save test case', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await executeTestCase(executeModal.tc._id, execForm);
      addToast(`Test case marked as ${execForm.status}`, 'success');
      setExecuteModal({ open: false, tc: null });
      loadTestCases(selectedSuite._id);
      loadSuites();
    } catch {
      addToast('Failed to execute test case', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTC = async () => {
    setSaving(true);
    try {
      await deleteTestCase(deleteDialog.id);
      addToast('Test case deleted', 'success');
      setDeleteDialog({ open: false, id: null, type: null });
      loadTestCases(selectedSuite._id);
      loadSuites();
    } catch {
      addToast('Failed to delete test case', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id, type) => setDeleteDialog({ open: true, id, type });

  if (loading) return <PageSpinner />;

  return (
    <div className="flex gap-6 h-full">
      {/* Suites Panel */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Test Suites</h3>
          <button onClick={() => setSuiteModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Suite
          </button>
        </div>

        {suites.length === 0 ? (
          <EmptyState title="No test suites" description="Create your first test suite to get started." />
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {suites.map(suite => (
              <SuiteCard
                key={suite._id}
                suite={suite}
                isSelected={selectedSuite?._id === suite._id}
                onClick={() => setSelectedSuite(suite)}
                onDelete={id => confirmDelete(id, 'suite')}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Test Cases Panel */}
      <div className="flex-1 min-w-0">
        {!selectedSuite ? (
          <div className="bg-white rounded-xl border border-slate-200 h-full flex items-center justify-center">
            <EmptyState
              title="Select a test suite"
              description="Choose a test suite from the left to view and manage test cases."
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            {/* TC Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800">{selectedSuite.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{testCases.length} test cases</p>
              </div>
              <button onClick={openCreateTC} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Test Case
              </button>
            </div>

            {/* TC List */}
            <div className="flex-1 overflow-y-auto">
              {tcLoading ? <PageSpinner /> : testCases.length === 0 ? (
                <EmptyState
                  title="No test cases"
                  description="Add test cases to this suite to start tracking test execution."
                  action={<button onClick={openCreateTC} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add First Test Case</button>}
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {testCases.map(tc => {
                    const statusInfo = statusIcons[tc.status] || statusIcons['Not Executed'];
                    return (
                      <div key={tc._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${statusInfo.bg} ${statusInfo.text}`}>
                              {statusInfo.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 text-sm">{tc.title}</p>
                              {tc.description && <p className="text-xs text-slate-500 mt-0.5">{tc.description}</p>}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(tc.status)}`}>{tc.status}</span>
                                <span className="text-xs text-slate-400">{tc.priority} Priority</span>
                                {tc.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(tc.assignedTo.name)}`}>
                                      {getInitials(tc.assignedTo.name)}
                                    </div>
                                    <span className="text-xs text-slate-500">{tc.assignedTo.name}</span>
                                  </div>
                                )}
                                {tc.executionComment && (
                                  <span className="text-xs text-slate-400 italic">"{tc.executionComment}"</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => { setExecForm({ status: 'Pass', executionComment: '' }); setExecuteModal({ open: true, tc }); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="Execute"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button onClick={() => openEditTC(tc)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {canDelete && (
                              <button onClick={() => confirmDelete(tc._id, 'testcase')} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Suite Modal */}
      <Modal isOpen={suiteModal} onClose={() => setSuiteModal(false)} title="Create Test Suite" size="sm">
        <form onSubmit={handleCreateSuite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Suite Name *</label>
            <input value={suiteForm.name} onChange={e => setSuiteForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Login Tests" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Description</label>
            <textarea value={suiteForm.description} onChange={e => setSuiteForm(p => ({ ...p, description: e.target.value }))}
              rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Project</label>
            <input value={suiteForm.project} onChange={e => setSuiteForm(p => ({ ...p, project: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project name" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setSuiteModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Suite'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Test Case Modal */}
      <Modal isOpen={tcModal.open} onClose={() => setTcModal({ open: false, tc: null })} title={tcModal.tc ? 'Edit Test Case' : 'Create Test Case'} size="md">
        <form onSubmit={handleSaveTC} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Title *</label>
            <input value={tcForm.title} onChange={e => setTcForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Test case title" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Description</label>
            <textarea value={tcForm.description} onChange={e => setTcForm(p => ({ ...p, description: e.target.value }))}
              rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What does this test verify?" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Test Steps (one per line)</label>
            <textarea value={tcForm.steps} onChange={e => setTcForm(p => ({ ...p, steps: e.target.value }))}
              rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="1. Navigate to login page&#10;2. Enter credentials&#10;3. Click Submit" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Expected Result</label>
            <input value={tcForm.expectedResult} onChange={e => setTcForm(p => ({ ...p, expectedResult: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What should happen" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Priority</label>
              <select value={tcForm.priority} onChange={e => setTcForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TEST_PRIORITY.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Assign To</label>
              <select value={tcForm.assignedTo} onChange={e => setTcForm(p => ({ ...p, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setTcModal({ open: false, tc: null })} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : (tcModal.tc ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Execute Modal */}
      <Modal isOpen={executeModal.open} onClose={() => setExecuteModal({ open: false, tc: null })} title="Execute Test Case" size="sm">
        <form onSubmit={handleExecute} className="space-y-4">
          {executeModal.tc && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-700">{executeModal.tc.title}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Execution Result</label>
            <div className="grid grid-cols-2 gap-2">
              {TEST_STATUS.filter(s => s !== 'Not Executed').map(status => {
                const info = statusIcons[status];
                return (
                  <button
                    key={status} type="button"
                    onClick={() => setExecForm(p => ({ ...p, status }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      execForm.status === status
                        ? `border-current ${info.bg} ${info.text}`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{info.icon}</span>
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Execution Comment</label>
            <textarea value={execForm.executionComment} onChange={e => setExecForm(p => ({ ...p, executionComment: e.target.value }))}
              rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add notes about the test execution..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setExecuteModal({ open: false, tc: null })} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, type: null })}
        onConfirm={deleteDialog.type === 'suite' ? handleDeleteSuite : handleDeleteTC}
        title={deleteDialog.type === 'suite' ? 'Delete Test Suite' : 'Delete Test Case'}
        message={deleteDialog.type === 'suite'
          ? 'This will delete the suite and all its test cases. This cannot be undone.'
          : 'Are you sure you want to delete this test case?'}
        isLoading={saving}
      />
    </div>
  );
};

export default TestCaseManagement;