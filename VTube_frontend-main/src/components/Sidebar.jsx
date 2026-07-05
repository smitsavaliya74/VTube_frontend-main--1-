import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Upload as UploadIcon, BarChart2,
  History, PlaySquare, ThumbsUp, Settings,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Discover',
    items: [
      { to: '/',    icon: <Home size={18} />,        label: 'Home',          end: true },
    ],
  },
  {
    label: 'Creator',
    items: [
      { to: '/upload',     icon: <UploadIcon size={18} />, label: 'Upload' },
      { to: '/dashboard',  icon: <BarChart2 size={18} />,  label: 'Dashboard' },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/history',       icon: <History size={18} />,    label: 'History' },
      { to: '/subscriptions', icon: <PlaySquare size={18} />, label: 'Subscriptions' },
      { to: '/liked',         icon: <ThumbsUp size={18} />,   label: 'Liked Videos' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { currentUser } = useAuth();

  const avatarSrc = currentUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || 'U')}&background=2563eb&color=fff`;

  // Filter groups: if not logged in, only show the "Discover" group
  const visibleGroups = currentUser 
    ? NAV_GROUPS 
    : NAV_GROUPS.filter(g => g.label === 'Discover');

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'mobile-open'}`} aria-label="Main navigation">
      {/* ── Mini Profile ── */}
      {currentUser && (
        <NavLink 
          to={`/channel/${currentUser.username}`} 
          className="sidebar-profile" 
          title={currentUser.fullName}
          onClick={() => { if (window.innerWidth <= 768) onToggleCollapse(); }}
        >
          <img src={avatarSrc} alt={currentUser.fullName} className="sidebar-profile-avatar" />
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{currentUser.fullName}</div>
            <div className="sidebar-profile-handle">@{currentUser.username}</div>
          </div>
        </NavLink>
      )}

      {/* ── Nav Groups ── */}
      <nav className="sidebar-nav" aria-label="Site navigation">
        {visibleGroups.map(group => (
          <div key={group.label}>
            <div className="sidebar-group-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => { if (window.innerWidth <= 768) onToggleCollapse(); }}
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Collapse Toggle ── */}
      <button
        className="sidebar-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="sidebar-icon" aria-hidden="true">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </span>
        <span>{collapsed ? '' : 'Collapse'}</span>
      </button>
    </aside>
  );
}
