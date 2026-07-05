import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi, subscriptionApi, videoApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BarChart2, Video, Eye, ThumbsUp, Users, X } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

const STAT_CONFIG = [
  { key: 'totalviews',       label: 'Total Views',       icon: Eye,       colorClass: 'stat-views' },
  { key: 'totalsubscribers', label: 'Subscribers',        icon: Users,     colorClass: 'stat-subs', clickable: true },
  { key: 'totallikes',       label: 'Total Likes',        icon: ThumbsUp,  colorClass: 'stat-likes' },
  { key: 'totalvideos',      label: 'Total Videos',       icon: Video,     colorClass: 'stat-videos' },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats]   = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [subscribers, setSubscribers]     = useState([]);
  const [subsLoading, setSubsLoading]     = useState(false);

  useEffect(() => { document.title = 'VTube — Dashboard'; }, []);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, videosRes] = await Promise.all([
          userApi.getChannelStats(currentUser._id),
          userApi.getChannelVideos(currentUser._id, 1, 50),
        ]);
        setStats(statsRes.data);
        setVideos(videosRes.data?.videos || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard data.', 'Dashboard Error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  const handleOpenSubscribers = async () => {
    setShowSubscribersModal(true);
    if (subscribers.length > 0) return;
    try {
      setSubsLoading(true);
      const res = await subscriptionApi.getChannelSubscribers(currentUser._id);
      setSubscribers(res.data?.subscribers || []);
    } catch { toast.error('Failed to load subscribers.'); }
    finally  { setSubsLoading(false); }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to permanently delete this video?')) return;
    try {
      await videoApi.deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      setStats(prev => prev ? { ...prev, totalvideos: (prev.totalvideos || 1) - 1 } : prev);
      toast.success('Video deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete video.');
    }
  };

  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const handleEditClick = (videoId) => {
    const vid = videos.find(v => v._id === videoId);
    if (vid) { setEditingVideo(vid); setEditTitle(vid.title); setEditDesc(vid.description); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      setEditSaving(true);
      await videoApi.updateVideo(editingVideo._id, editTitle, editDesc);
      setVideos(prev => prev.map(v => v._id === editingVideo._id ? { ...v, title: editTitle, description: editDesc } : v));
      toast.success('Video updated!');
      setEditingVideo(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update video.');
    } finally { setEditSaving(false); }
  };

  if (loading) return <DashboardSkeleton />;

  const fmt = n => (n || 0).toLocaleString();

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <h1><BarChart2 size={28} /> Creator Dashboard</h1>
        <p>Welcome back, <strong>{currentUser?.fullName}</strong>! Here's your channel at a glance.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, icon: Icon, colorClass, clickable }) => (
          <div
            key={key}
            className={`glass-card stat-card ${clickable ? 'clickable' : ''}`}
            onClick={clickable ? handleOpenSubscribers : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={clickable ? e => e.key === 'Enter' && handleOpenSubscribers() : undefined}
            aria-label={clickable ? `${label}: ${fmt(stats?.[key])} — click to view` : undefined}
          >
            <div className={`stat-icon ${colorClass}`}>
              <Icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{label}{clickable && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 6 }}>↗</span>}</div>
              <div className="stat-number">{fmt(stats?.[key])}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Videos */}
      <div>
        <h2 className="section-title">Your Uploads</h2>
        {videos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📹</div>
            <div className="empty-state-title">No videos yet</div>
            <p className="empty-state-desc">Start sharing your content with the world!</p>
            <Link to="/upload" className="btn btn-primary">Upload your first video</Link>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map(v => (
              <VideoCard
                key={v._id}
                id={v._id}
                title={v.title}
                channelName={currentUser.fullName}
                username={currentUser.username}
                views={v.views}
                createdAt={v.createdAt}
                thumbnail={v.thumbnailfile}
                avatar={currentUser.avatar}
                duration={v.duration}
                isOwner={true}
                onEdit={handleEditClick}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingVideo(null)}>
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Edit Video</h2>
              <button className="modal-close-btn" onClick={() => setEditingVideo(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSave} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 6 }}>Title</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required maxLength={100}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4} maxLength={5000}
                  style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <button type="submit" disabled={editSaving} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subscribers Modal */}
      {showSubscribersModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSubscribersModal(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Your Subscribers</h2>
              <button className="modal-close-btn" onClick={() => setShowSubscribersModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {subsLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
              ) : subscribers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No subscribers yet.</div>
              ) : (
                subscribers.map(sub => (
                  <Link to={`/channel/${sub.subscriber.username}`} key={sub._id} onClick={() => setShowSubscribersModal(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 8px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit', transition: 'background var(--transition-fast)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={sub.subscriber.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.subscriber.fullName)}&background=2563eb&color=fff`}
                      alt={sub.subscriber.fullName}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{sub.subscriber.fullName}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>@{sub.subscriber.username}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .dashboard-header h1 {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 8px;
        }
        .dashboard-header p {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
          gap: 20px;
        }
        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .stat-card.clickable { cursor: pointer; }
        .stat-icon {
          width: 54px; height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-views   { background: var(--color-success-bg);  color: var(--color-success); }
        .stat-subs    { background: var(--color-primary-muted); color: var(--color-primary-light); }
        .stat-likes   { background: var(--color-info-bg);     color: var(--color-info); }
        .stat-videos  { background: var(--color-error-bg);    color: var(--color-error); }
        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
          margin-bottom: 4px;
        }
        .stat-number {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
