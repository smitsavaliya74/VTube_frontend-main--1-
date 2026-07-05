import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Video, Sun, Moon, Monitor, Bell,
  LogOut, Settings, BarChart2, User, ChevronDown, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { videoApi } from '../services/api';

const THEME_ICONS = {
  dark:   <Moon size={17} />,
  light:  <Sun size={17} />,
  system: <Monitor size={17} />,
};

const THEME_LABELS = { dark: 'Dark', light: 'Light', system: 'System' };

export default function Navbar({ onToggleSidebar, showHamburger }) {
  const [searchQuery, setSearchQuery]     = useState('');
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount]           = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const navigate = useNavigate();

  const searchRef  = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // ── Search suggestions (debounced 300ms) ──
  useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await videoApi.getVideos(1, 6, searchQuery);
        setSuggestions(data.data?.videos || []);
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSuggestions(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setShowSuggestions(false);
    setShowMobileSearch(false);
    navigate(q ? `/results?search_query=${encodeURIComponent(q)}` : '/');
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    setShowMobileSearch(false);
    navigate(`/results?search_query=${encodeURIComponent(title)}`);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <nav className={`navbar glass ${showMobileSearch ? 'mobile-search-active' : ''}`} role="banner">
      {/* ─── Left ─── */}
      <div className={`nav-left ${showMobileSearch ? 'hidden' : ''}`}>
        {showHamburger && (
          <button
            className="icon-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="logo" aria-label="VTube Home">
          <div className="logo-icon">
            <Video size={22} color="var(--color-primary-light)" />
          </div>
          <span className="logo-text">V<span className="logo-accent">Tube</span></span>
        </Link>
      </div>

      {/* ─── Center Search ─── */}
      <div className={`nav-center ${showMobileSearch ? 'active' : ''}`} ref={searchRef}>
        <div className="search-container">
          {showMobileSearch && (
            <button 
              type="button" 
              className="icon-btn mobile-search-back" 
              onClick={() => setShowMobileSearch(false)}
            >
              <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
            </button>
          )}
          <form onSubmit={handleSearch} className="search-bar" role="search">
            <input
              type="search"
              placeholder="Search videos, channels..."
              value={searchQuery}
              autoComplete="off"
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              aria-label="Search"
            />
            <button type="submit" className="search-btn" aria-label="Submit search">
              <Search size={17} />
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass" role="listbox" aria-label="Search suggestions">
              {suggestions.map(v => (
                <div
                  key={v._id}
                  className="suggestion-item"
                  role="option"
                  onClick={() => handleSuggestionClick(v.title)}
                >
                  <Search size={15} className="suggestion-icon" />
                  <span className="suggestion-text">{v.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Right ─── */}
      <div className={`nav-right ${showMobileSearch ? 'hidden' : ''}`}>
        {/* Mobile search toggle */}
        <button
          className="icon-btn mobile-search-btn"
          onClick={() => setShowMobileSearch(true)}
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        {/* Theme toggle */}
        <button
          className="icon-btn theme-btn"
          onClick={toggleTheme}
          title={`Theme: ${THEME_LABELS[theme]} (click to switch)`}
          aria-label={`Switch theme, current: ${THEME_LABELS[theme]}`}
        >
          {THEME_ICONS[theme]}
        </button>

        {currentUser ? (
          <>
            {/* Notifications */}
            <div className="user-menu-wrapper" ref={notifRef}>
              <button 
                className={`icon-btn ${showNotifications ? 'active' : ''}`} 
                aria-label="Notifications"
                onClick={() => setShowNotifications(v => !v)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-badge" style={{ fontSize: 0, width: 10, height: 10, padding: 0 }}></span>}
              </button>
              
              {showNotifications && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Notifications</h3>
                  </div>
                  <div style={{ padding: '0', maxHeight: '300px', overflowY: 'auto' }}>
                    <div style={{ padding: '16px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', background: unreadCount > 0 ? 'var(--color-primary-muted)' : 'transparent' }}>
                      <div style={{ background: 'var(--color-primary)', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Video size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          <strong>Welcome to VTube!</strong> We're glad you're here. Discover amazing content.
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary-light)' }}>Just now</span>
                      </div>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="user-dropdown-header" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: 'none', justifyContent: 'center' }}>
                      <button 
                        onClick={() => setUnreadCount(0)}
                        style={{ background: 'transparent', border: 'none', fontSize: 'var(--text-sm)', color: 'var(--text-primary-light)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User avatar + dropdown */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                className="profile-btn"
                onClick={() => setShowUserMenu(v => !v)}
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <img
                  src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'U')}&background=2563eb&color=fff`}
                  alt={currentUser.fullName || 'User Avatar'}
                  onError={e => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'U')}&background=2563eb&color=fff`;
                  }}
                />
              </button>

              {showUserMenu && (
                <div className="user-dropdown animate-fade-in-scale" role="menu">
                  {/* Header */}
                  <div className="user-dropdown-header">
                    <img
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'U')}&background=2563eb&color=fff`}
                      alt={currentUser.fullName}
                      className="user-dropdown-avatar"
                    />
                    <div>
                      <div className="user-dropdown-name">{currentUser.fullName}</div>
                      <div className="user-dropdown-username">@{currentUser.username}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <Link
                    to={`/channel/${currentUser.username}`}
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                  >
                    <User size={16} /> Your Channel
                  </Link>
                  <Link
                    to="/dashboard"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                  >
                    <BarChart2 size={16} /> Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                  >
                    <Settings size={16} /> Settings
                  </Link>

                  <div className="user-dropdown-divider" />

                  <button
                    className="user-dropdown-item danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="login-btn">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
