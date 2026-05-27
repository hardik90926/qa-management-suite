import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/bugs': 'Bug Tracker',
  '/test-cases': 'Test Case Manager',
  '/users': 'User Management',
  '/profile': 'Profile'
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'QA Management Suite';

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            {user?.role}
          </span>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(user?.name)}`}>
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;