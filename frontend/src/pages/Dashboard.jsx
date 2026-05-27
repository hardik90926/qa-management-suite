import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDashboardMetrics } from '../services/dashboardService';
import { PageSpinner } from '../components/common/Spinner';
import { timeAgo, getStatusStyle, getPriorityStyle, getSeverityStyle } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

const SEVERITY_COLORS = { Minor: '#94a3b8', Major: '#f97316', Blocker: '#ef4444' };
const PRIORITY_COLORS = { Low: '#94a3b8', Medium: '#3b82f6', High: '#f97316', Critical: '#ef4444' };
const TEST_COLORS = ['#22c55e', '#ef4444', '#f97316', '#94a3b8'];

const KPICard = ({ label, value, icon, color, subLabel, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
      </div>
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const actionColors = {
    created: 'bg-green-100 text-green-600',
    updated: 'bg-blue-100 text-blue-600',
    deleted: 'bg-red-100 text-red-600',
    status_changed: 'bg-yellow-100 text-yellow-600',
    executed: 'bg-purple-100 text-purple-600',
    assigned: 'bg-indigo-100 text-indigo-600',
    logged_in: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium capitalize flex-shrink-0 ${actionColors[activity.action] || 'bg-gray-100 text-gray-600'}`}>
        {activity.action.replace('_', ' ')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 leading-snug">{activity.description}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {activity.user?.name} · {timeAgo(activity.createdAt)}
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardMetrics();
        setMetrics(res.data.metrics);
      } catch {
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  if (loading) return <PageSpinner />;
  if (!metrics) return null;

  const { bugs, testCases, charts, recentActivities, recentBugs } = metrics;

  const testChartData = [
    { name: 'Pass', value: testCases.pass },
    { name: 'Fail', value: testCases.fail },
    { name: 'Blocked', value: testCases.blocked },
    { name: 'Not Run', value: testCases.notExecuted }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Bugs"
          value={bugs.total}
          color="bg-slate-100"
          subLabel={`${bugs.fixed + bugs.closed} resolved`}
          onClick={() => navigate('/bugs')}
          icon={<svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard
          label="Open Bugs"
          value={bugs.open}
          color="bg-red-50"
          subLabel="status: Open"
          onClick={() => navigate('/bugs?status=Open')}
          icon={<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <KPICard
          label="In Progress"
          value={bugs.inProgress}
          color="bg-yellow-50"
          subLabel="status: In Progress"
          onClick={() => navigate('/bugs?status=In Progress')}
          icon={<svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard
          label="Closed Bugs"
          value={bugs.fixed + bugs.closed}
          color="bg-green-50"
          subLabel={`${bugs.fixed} fixed · ${bugs.closed} closed`}
          onClick={() => navigate('/bugs')}
          icon={<svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bug Severity Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Bugs by Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={charts.bugsBySeverity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {charts.bugsBySeverity.map((entry) => (
                  <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bug Priority Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Bugs by Priority</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.bugsByPriority} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {charts.bugsByPriority.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Test Results Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Test Execution Results</h3>
          {testChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={testChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {testChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={TEST_COLORS[index % TEST_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No test data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bugs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Recent Bugs</h3>
            <button onClick={() => navigate('/bugs')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBugs.length === 0 ? (
              <p className="text-sm text-slate-400 p-5 text-center">No bugs reported yet</p>
            ) : (
              recentBugs.map(bug => (
                <div key={bug._id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700 truncate flex-1">{bug.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusStyle(bug.status)}`}>
                      {bug.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getPriorityStyle(bug.priority)}`}>{bug.priority}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getSeverityStyle(bug.severity)}`}>{bug.severity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="px-5 divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-slate-400 py-5 text-center">No recent activity</p>
            ) : (
              recentActivities.map(activity => (
                <ActivityItem key={activity._id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;