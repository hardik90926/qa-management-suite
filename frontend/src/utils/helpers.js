export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const timeAgo = (date) => {
  if (!date) return 'N/A';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getStatusStyle = (status) => {
  const map = {
    'Open': 'status-open',
    'In Progress': 'status-in-progress',
    'Fixed': 'status-fixed',
    'Closed': 'status-closed',
    'Pass': 'status-pass',
    'Fail': 'status-fail',
    'Blocked': 'status-blocked',
    'Not Executed': 'status-not-executed'
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

export const getPriorityStyle = (priority) => {
  const map = {
    'Low': 'priority-low',
    'Medium': 'priority-medium',
    'High': 'priority-high',
    'Critical': 'priority-critical'
  };
  return map[priority] || 'bg-gray-100 text-gray-600';
};

export const getSeverityStyle = (severity) => {
  const map = {
    'Minor': 'severity-minor',
    'Major': 'severity-major',
    'Blocker': 'severity-blocker'
  };
  return map[severity] || 'bg-gray-100 text-gray-600';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};