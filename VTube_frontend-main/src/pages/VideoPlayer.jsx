import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, ListPlus, X, Plus } from 'lucide-react';
import { videoApi, interactionApi, userApi, playlistApi, subscriptionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Comments from '../components/Comments';
import VideoCard from '../components/VideoCard';
import VideoPlayerSkeleton from '../components/skeletons/VideoPlayerSkeleton';

export default function VideoPlayer() {
  const { videoId }  = useParams();
  const navigate     = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [video, setVideo]           = useState(null);
  const [suggested, setSuggested]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewCount, setViewCount]   = useState(0);
  const [likes, setLikes]           = useState(0);
  const [isLiked, setIsLiked]       = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikes, setDislikes]     = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Playlist modal
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists]         = useState([]);
  const [newPlaylistName, setNewPlaylistName]     = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc]     = useState('');
  const [playlistLoading, setPlaylistLoading]     = useState(false);

  useEffect(() => {
    document.title = video ? `${video.title} — VTube` : 'VTube';
  }, [video]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [vRes] = await Promise.all([
          videoApi.getVideoById(videoId),
        ]);
        const v = vRes.data;
        setVideo(v);
        // The backend already returns the incremented view count in the response
        setViewCount(v?.views || 0);
        // Use video title as search query for related/suggested videos
        const titleQuery = v?.title ? v.title.split(' ').slice(0, 3).join(' ') : '';
        const suggestedRes = await videoApi.getVideos(1, 15, titleQuery);
        setSuggested(suggestedRes.data?.videos?.filter(x => x._id !== videoId) || []);

        if (currentUser) {
          userApi.addVideoToHistory(videoId).catch(() => {});
        }

        const lRes = await interactionApi.getVideoLikes(videoId);
        setLikes(lRes.data?.totalLikes || 0);
        setIsLiked(lRes.data?.isLiked || false);

        // Fetch dislike status + count (optional auth — won't throw)
        try {
          const dRes = await interactionApi.getVideoDislikeStatus(videoId);
          setIsDisliked(dRes.data?.isDisliked || false);
          setDislikes(dRes.data?.totalDislikes || 0);
        } catch { /* ignore */ }

        const channelUsername = v?.owner?.username || v?.ownerDetails?.username;
        if (channelUsername) {
          const pRes = await userApi.getChannelProfile(channelUsername);
          setIsSubscribed(pRes.data?.isSubscribed || false);
          setSubscribersCount(pRes.data?.subscribersCount || 0);
        }
      } catch {
        toast.error('Failed to load video. Please try again.', 'Video Error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [videoId]);

  const handleLike = async () => {
    if (!currentUser) return navigate('/login');
    try {
      const currentlyLiked = isLiked;
      await interactionApi.toggleVideoLike(videoId);
      setIsLiked(!currentlyLiked);
      setLikes(v => currentlyLiked ? v - 1 : v + 1);
      // If liking while disliked, remove dislike optimistically
      if (!currentlyLiked && isDisliked) {
        setIsDisliked(false);
        setDislikes(v => Math.max(0, v - 1));
      }
    } catch { toast.error('Could not update like.'); }
  };

  const handleDislike = async () => {
    if (!currentUser) return navigate('/login');
    try {
      const currentlyDisliked = isDisliked;
      await interactionApi.toggleVideoDislike(videoId);
      setIsDisliked(!currentlyDisliked);
      setDislikes(v => currentlyDisliked ? Math.max(0, v - 1) : v + 1);
      // If disliking while liked, remove the like optimistically
      if (!currentlyDisliked && isLiked) {
        setIsLiked(false);
        setLikes(v => Math.max(0, v - 1));
      }
    } catch { toast.error('Could not update dislike.'); }
  };

  const handleSubscribe = async () => {
    if (!currentUser) return navigate('/login');
    try {
      const channelId = video?.ownerDetails?._id || video?.owner?._id || video?.owner;
      await subscriptionApi.toggleSubscription(channelId);
      setIsSubscribed(v => !v);
      setSubscribersCount(v => isSubscribed ? v - 1 : v + 1);
      toast.success(isSubscribed ? 'Unsubscribed from channel.' : 'Subscribed!');
    } catch { toast.error('Could not update subscription.'); }
  };

  const fetchUserPlaylists = async () => {
    try {
      setPlaylistLoading(true);
      const res = await playlistApi.getUserPlaylists(currentUser._id, 1, 50);
      setUserPlaylists(res.data?.playlists || []);
    } catch { toast.error('Failed to fetch playlists.'); }
    finally  { setPlaylistLoading(false); }
  };

  const openPlaylistModal = async () => {
    if (!currentUser) return navigate('/login');
    setShowPlaylistModal(true);
    fetchUserPlaylists();
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      setPlaylistLoading(true);
      await playlistApi.createPlaylist(newPlaylistName, newPlaylistDesc);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      await fetchUserPlaylists();
      toast.success('Playlist created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create playlist.');
      setPlaylistLoading(false);
    }
  };

  const handleToggleVideoInPlaylist = async (playlistId, isInPlaylist, playlistName) => {
    try {
      if (isInPlaylist) {
        await playlistApi.removeVideoFromPlaylist(playlistId, videoId);
        toast.info(`Removed from "${playlistName}"`);
      } else {
        await playlistApi.addVideoToPlaylist(playlistId, videoId);
        toast.success(`Added to "${playlistName}"`);
      }
      setUserPlaylists(prev => prev.map(pl => pl._id === playlistId ? {
        ...pl,
        videos: isInPlaylist
          ? pl.videos.filter(v => v !== videoId && v._id !== videoId)
          : [...pl.videos, videoId],
      } : pl));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update playlist.');
    }
  };

  if (loading) return <VideoPlayerSkeleton />;

  if (!video) return (
    <div className="empty-state" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      <div className="empty-state-title">Video not found</div>
      <p className="empty-state-desc">This video may have been removed or doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );

  const ownerName = video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown Channel';
  const ownerUsername = video.ownerDetails?.username || video.owner?.username;
  const ownerAvatar = video.ownerDetails?.avatar || video.owner?.avatar;

  const formatTimeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
    return `${Math.floor(diff/2592000)}mo ago`;
  };

  const formatViews = (v) => {
    if (v >= 1_000_000) return `${(v/1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v/1_000).toFixed(1)}K`;
    return String(v || 0);
  };

  return (
    <div className="player-container animate-fade-in">
      {/* ── Left: Video + Details ── */}
      <div className="primary-column">
        <div className="video-wrapper">
          <video
            src={video.videofile}
            poster={video.thumbnailfile}
            controls
            autoPlay
            className="video-element"
            aria-label={video.title}
          />
        </div>

        <h1 className="vp-title">{video.title}</h1>
        <div className="vp-view-date">
          <span>{formatViews(viewCount)} views</span>
          <span className="vp-dot">·</span>
          <span>{formatTimeAgo(video.createdAt)}</span>
        </div>

        <div className="vp-meta-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to={`/channel/${ownerUsername}`} className="channel-link">
              <img
                src={ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=2563eb&color=fff`}
                alt={ownerName}
                className="vp-channel-avatar"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=2563eb&color=fff`; }}
              />
              <div>
                <div className="vp-channel-name">{ownerName}</div>
                <div className="vp-sub-count">{formatViews(subscribersCount)} subscribers</div>
              </div>
            </Link>
            <button
              className={`subscribe-btn btn-pill ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
              aria-label={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          <div className="vp-actions">
            <div className="vp-action-group glass">
              <button
                className={`vp-action-btn ${isLiked ? 'active' : ''}`}
                onClick={handleLike}
                aria-label={`${isLiked ? 'Unlike' : 'Like'} video — ${likes} likes`}
              >
                <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{likes}</span>
              </button>
              <div className="vp-divider" />
              <button
                className={`vp-action-btn ${isDisliked ? 'active dislike-active' : ''}`}
                onClick={handleDislike}
                aria-label={isDisliked ? 'Remove dislike' : 'Dislike video'}
              >
                <ThumbsDown size={18} fill={isDisliked ? 'currentColor' : 'none'} />
                <span>{dislikes}</span>
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <button className="vp-action-btn glass vp-pill-btn" onClick={openPlaylistModal} aria-label="Save to playlist">
                <ListPlus size={18} /> <span>Save</span>
              </button>

              {showPlaylistModal && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div style={{ position: 'fixed', inset: 0, zIndex: 190 }} onClick={() => setShowPlaylistModal(false)} />
                  
                  <div className="playlist-dropdown glass">
                    <div className="playlist-dropdown-header">
                      <h3>Save to Playlist</h3>
                      <button onClick={() => setShowPlaylistModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                      {playlistLoading && userPlaylists.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '10px 0', fontSize: 'var(--text-sm)' }}>Loading...</div>
                      ) : userPlaylists.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '10px 0', fontSize: 'var(--text-sm)' }}>No playlists yet.</div>
                      ) : (
                        userPlaylists.map(pl => {
                          const inPl = pl.videos.some(v => v === videoId || v._id === videoId);
                          return (
                            <div key={pl._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                              <input
                                type="checkbox"
                                id={`pl-${pl._id}`}
                                checked={inPl}
                                onChange={() => handleToggleVideoInPlaylist(pl._id, inPl, pl.name)}
                                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                              />
                              <label htmlFor={`pl-${pl._id}`} style={{ display: 'flex', justifyContent: 'space-between', flex: 1, cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                                <span>{pl.name}</span>
                              </label>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', marginBottom: 10, fontWeight: 500 }}>
                        <Plus size={14} /> New Playlist
                      </h4>
                      <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input className="modal-input" style={{ fontSize: 'var(--text-sm)', padding: '6px 10px' }} type="text" placeholder="Playlist name" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} required />
                        <input className="modal-input" style={{ fontSize: 'var(--text-sm)', padding: '6px 10px' }} type="text" placeholder="Description (required)" value={newPlaylistDesc} onChange={e => setNewPlaylistDesc(e.target.value)} required />
                        <button type="submit" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)', padding: '6px' }} disabled={playlistLoading || !newPlaylistName.trim() || !newPlaylistDesc.trim()}>
                          {playlistLoading ? 'Creating...' : 'Create'}
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="vp-description glass">
          <div className="vp-desc-meta">
            <span><strong>{formatViews(video.views)}</strong> views</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
          <p className="vp-desc-text">{video.description}</p>
        </div>

        {/* Comments */}
        <Comments videoId={videoId} />
      </div>

      {/* ── Right: Suggested ── */}
      <div className="secondary-column">
        {suggested.map(v => (
          <VideoCard
            key={v._id}
            id={v._id}
            title={v.title}
            channelName={v.ownerDetails?.fullName || v.owner?.fullName || 'Unknown'}
            username={v.ownerDetails?.username || v.owner?.username}
            views={v.views}
            createdAt={v.createdAt}
            thumbnail={v.thumbnailfile}
            avatar={v.ownerDetails?.avatar || v.owner?.avatar}
            duration={v.duration}
          />
        ))}
      </div>

      {/* Modal moved to dropdown above */}

      <style>{`
        .player-container {
          display: flex;
          gap: 24px;
          padding: 24px;
          max-width: 1800px;
          margin: 0 auto;
          align-items: flex-start;
        }
        .primary-column { flex: 1; min-width: 0; }
        .secondary-column {
          width: 380px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-shrink: 0;
        }
        .video-wrapper {
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 18px;
          box-shadow: var(--shadow-lg);
        }
        .video-element { width: 100%; height: 100%; outline: none; }
        .vp-title {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          line-height: 1.4;
          margin-bottom: 8px;
        }
        .vp-view-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .vp-dot { color: var(--text-muted); }
        .vp-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 18px;
        }
        .vp-channel-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }
        .vp-channel-name { font-weight: var(--font-semibold); font-size: var(--text-base); }
        .vp-sub-count { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
        .vp-actions { display: flex; gap: 10px; align-items: center; }
        .vp-action-group {
          display: flex;
          align-items: center;
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .vp-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 9px 16px;
          cursor: pointer;
          font-weight: var(--font-semibold);
          font-size: var(--text-sm);
          font-family: inherit;
          transition: background var(--transition-fast);
        }
        .vp-action-btn:hover { background: rgba(255,255,255,0.08); }
        .vp-action-btn.active { color: var(--color-primary-light); }
        .vp-action-btn.dislike-active { color: var(--color-error); }
        .vp-divider { width: 1px; height: 24px; background: var(--border-default); }
        .vp-pill-btn { border-radius: var(--radius-full); padding: 9px 18px; }
        .vp-description {
          padding: 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
        }
        .vp-desc-meta {
          display: flex;
          gap: 16px;
          font-size: var(--text-sm);
          margin-bottom: 10px;
          color: var(--text-secondary);
        }
        .vp-desc-text {
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          white-space: pre-wrap;
          color: var(--text-primary);
        }
        .playlist-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xl);
          z-index: 200;
          padding: 16px;
          display: flex;
          flex-direction: column;
          animation: fadeInScale 0.15s ease-out;
        }
        .playlist-dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .playlist-dropdown-header h3 {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }
        @media (max-width: 1024px) {
          .player-container { flex-direction: column; }
          .secondary-column { width: 100%; }
        }
        @media (max-width: 768px) {
          .player-container { padding: 12px; gap: 16px; }
          .video-wrapper { 
            margin-left: -12px; 
            margin-right: -12px; 
            width: calc(100% + 24px); 
            border-radius: 0; 
            margin-top: -12px; 
            margin-bottom: 12px;
          }
          .vp-title { font-size: var(--text-lg); margin-bottom: 10px; }
          .vp-meta-row { gap: 12px; margin-bottom: 14px; }
          .vp-actions { width: 100%; justify-content: space-between; overflow-x: auto; padding-bottom: 4px; }
        }
      `}</style>
    </div>
  );
}
