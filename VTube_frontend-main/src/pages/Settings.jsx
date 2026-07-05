import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { userApi } from '../services/api';
import { Camera, Lock, User, Image as ImageIcon, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsSkeleton from '../components/skeletons/SettingsSkeleton';

const THEMES = [
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Easy on the eyes' },
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Classic bright mode' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS' },
];

export default function Settings() {
  const { currentUser, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile]     = useState(null);
  const [coverPreview, setCoverPreview]   = useState('');

  const [loading, setLoading] = useState({
    details: false, password: false, avatar: false, cover: false
  });

  const [pageReady, setPageReady] = useState(false);

  useEffect(() => { document.title = 'VTube — Settings'; }, []);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    setFullName(currentUser.fullName || '');
    setEmail(currentUser.email || '');
    setAvatarPreview(currentUser.avatar || '');
    setCoverPreview(currentUser.coverImage || '');
    setTimeout(() => setPageReady(true), 300); // brief delay for skeleton demo
  }, [currentUser, navigate]);

  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setLoad('details', true);
      await userApi.updateAccountDetails(fullName, email);
      await refreshUser(); // Update Navbar immediately
      toast.success('Account details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update details.');
    } finally { setLoad('details', false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.warning('New password must be at least 8 characters.');
      return;
    }
    try {
      setLoad('password', true);
      await userApi.changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setLoad('password', false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file.'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file.'); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setLoad('avatar', true);
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      await userApi.updateAvatar(fd);
      await refreshUser(); // Update Navbar avatar immediately
      toast.success('Avatar updated!');
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update avatar.');
    } finally { setLoad('avatar', false); }
  };

  const uploadCover = async () => {
    if (!coverFile) return;
    try {
      setLoad('cover', true);
      const fd = new FormData();
      fd.append('coverImage', coverFile);
      await userApi.updateCoverImage(fd);
      await refreshUser(); // Update channel cover immediately
      toast.success('Cover image updated!');
      setCoverFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cover image.');
    } finally { setLoad('cover', false); }
  };

  if (!currentUser || !pageReady) return <SettingsSkeleton />;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'U')}&background=2563eb&color=fff&size=200`;

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your profile, security, and app preferences</p>
      </div>

      <div className="settings-grid">
        {/* ── Profile Images ── */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <ImageIcon size={18} color="var(--color-primary-light)" />
            <h2>Profile Images</h2>
          </div>

          <div>
            <label className="settings-label">Cover Image</label>
            <div className="cover-preview" style={{ backgroundImage: coverPreview ? `url("${coverPreview}")` : 'none', backgroundColor: coverPreview ? 'transparent' : 'var(--bg-tertiary)' }}>
              <div className="img-overlay">
                <label htmlFor="cover-upload" className="img-overlay-btn">
                  <Camera size={16} /> Change Cover
                </label>
                <input id="cover-upload" type="file" accept="image/*" onChange={handleCoverChange} hidden />
              </div>
            </div>
            {coverFile && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={uploadCover} disabled={loading.cover}>
                {loading.cover ? 'Uploading...' : 'Save Cover'}
              </button>
            )}
          </div>

          <div>
            <label className="settings-label">Avatar</label>
            <div className="avatar-preview-wrapper">
              <img src={avatarPreview || fallbackAvatar} alt="Avatar preview" className="avatar-preview-img"
                onError={e => { e.target.src = fallbackAvatar; }} />
              <div className="img-overlay circle-overlay">
                <label htmlFor="avatar-upload" className="img-overlay-btn icon-only" aria-label="Change avatar">
                  <Camera size={18} />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </div>
            </div>
            {avatarFile && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={uploadAvatar} disabled={loading.avatar}>
                {loading.avatar ? 'Uploading...' : 'Save Avatar'}
              </button>
            )}
          </div>
        </div>

        {/* ── Personal Info ── */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <User size={18} color="var(--color-success)" />
            <h2>Personal Information</h2>
          </div>
          <form onSubmit={handleUpdateDetails} className="settings-form">
            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>
              <input id="fullname" className="form-input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input className="form-input" type="text" value={`@${currentUser.username}`} disabled />
              <span className="input-helper">Usernames cannot be changed.</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading.details} style={{ width: '100%' }}>
              {loading.details ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* ── Security ── */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Lock size={18} color="var(--color-error)" />
            <h2>Security</h2>
          </div>
          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label htmlFor="oldpwd">Current Password</label>
              <input id="oldpwd" className="form-input" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label htmlFor="newpwd">New Password</label>
              <input id="newpwd" className="form-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min. 8 characters" minLength={8} />
              <span className="input-helper">{newPassword.length}/8 minimum characters</span>
            </div>
            <button type="submit" className="btn btn-danger" disabled={loading.password} style={{ width: '100%' }}>
              {loading.password ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* ── Appearance / Theme ── */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Sun size={18} color="var(--color-warning)" />
            <h2>Appearance</h2>
          </div>
          <div>
            <label className="settings-label">Theme</label>
            <div className="theme-selector">
              {THEMES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  className={`theme-option ${theme === value ? 'active' : ''}`}
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  title={desc}
                >
                  <Icon size={20} />
                  <span className="theme-option-label">{label}</span>
                  <span className="theme-option-desc">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .settings-header { margin-bottom: 32px; }
        .settings-header h1 {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          margin-bottom: 8px;
        }
        .settings-header p { color: var(--text-secondary); }
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px,1fr));
          gap: 24px;
        }
        .settings-card {
          padding: 24px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .settings-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 14px;
        }
        .settings-card-header h2 {
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
        }
        .settings-label {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          margin-bottom: 10px;
          display: block;
        }
        .settings-form { display: flex; flex-direction: column; gap: 16px; }
        .cover-preview {
          width: 100%;
          height: 110px;
          border-radius: var(--radius-md);
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border-default);
        }
        .avatar-preview-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--border-default);
        }
        .avatar-preview-img { width: 100%; height: 100%; object-fit: cover; }
        .img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .circle-overlay { border-radius: 50%; }
        .cover-preview:hover .img-overlay,
        .avatar-preview-wrapper:hover .img-overlay { opacity: 1; }
        .img-overlay-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          color: #fff;
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          font-family: inherit;
          border: none;
          transition: background var(--transition-fast);
        }
        .img-overlay-btn.icon-only { padding: 10px; }
        .img-overlay-btn:hover { background: rgba(255,255,255,0.35); }
        /* Theme Selector */
        .theme-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-default);
          background: var(--bg-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: inherit;
          color: var(--text-secondary);
        }
        .theme-option:hover {
          border-color: var(--color-primary);
          color: var(--text-primary);
        }
        .theme-option.active {
          border-color: var(--color-primary);
          background: var(--color-primary-muted);
          color: var(--color-primary-light);
          box-shadow: var(--shadow-glow-sm);
        }
        .theme-option-label {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
        }
        .theme-option-desc {
          font-size: 10px;
          color: var(--text-muted);
          text-align: center;
        }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
