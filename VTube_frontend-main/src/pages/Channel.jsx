import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userApi, interactionApi, videoApi, playlistApi, subscriptionApi, tweetApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VideoCard from '../components/VideoCard';
import TweetCard from '../components/TweetCard';
import ChannelSkeleton from '../components/skeletons/ChannelSkeleton';
import { Users, X, ListVideo, Plus, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Channel() {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  const [activeTab, setActiveTab] = useState('videos');

  const navigate = useNavigate();

  // Edit Video State
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Playlist Modal State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistTargetVideoId, setPlaylistTargetVideoId] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [playlistModalLoading, setPlaylistModalLoading] = useState(false);

  // Community Tab State
  const [newTweetContent, setNewTweetContent] = useState("");
  const [tweetLoading, setTweetLoading] = useState(false);

  useEffect(() => {
    document.title = profile ? `${profile.fullName} — VTube` : 'VTube — Channel';
  }, [profile]);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch Profile
        const pData = await userApi.getChannelProfile(username);
        const channelData = pData.data;
        setProfile(channelData);
        setIsSubscribed(channelData.isSubscribed);
        setSubscribersCount(channelData.subscribersCount);
        
        // Fetch Channel Videos, Playlists, and Tweets
        if (channelData._id) {
          const vData = await userApi.getChannelVideos(channelData._id);
          setVideos(vData.data?.videos || []);
          
          try {
            const pData = await playlistApi.getUserPlaylists(channelData._id);
            setPlaylists(pData.data?.playlists || []);
          } catch (e) {
            console.error("Failed to load playlists", e);
          }

          try {
            const tData = await tweetApi.getUserTweets(channelData._id);
            setTweets(tData.data?.tweets || []);
          } catch (e) {
            console.error("Failed to load tweets", e);
          }
        }

      } catch (err) {
        console.error("Failed to fetch channel", err);
        setError(err.response?.data?.message || err.message || 'Failed to load channel.');
      } finally {
        setLoading(false);
      }
    };
    
    if (username) fetchChannelData();
  }, [username]);

  const handleSubscribe = async () => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      await subscriptionApi.toggleSubscription(profile._id);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
      toast.success(isSubscribed ? 'Unsubscribed.' : 'Subscribed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update subscription.');
    }
  };

  const handleEditClick = (videoId) => {
    const vid = videos.find(v => v._id === videoId);
    if (vid) {
      setEditingVideo(vid);
      setEditTitle(vid.title);
      setEditDescription(vid.description);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await videoApi.updateVideo(editingVideo._id, editTitle, editDescription);
      setVideos(videos.map(v =>
        v._id === editingVideo._id ? { ...v, title: editTitle, description: editDescription } : v
      ));
      setEditingVideo(null);
      toast.success('Video updated successfully!');
    } catch (err) {
      toast.error('Failed to update video: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    try {
      await videoApi.deleteVideo(videoId);
      setVideos(videos.filter(v => v._id !== videoId));
      toast.success('Video deleted.');
    } catch (err) {
      toast.error('Failed to delete video: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenPlaylistModal = (videoId) => {
    setPlaylistTargetVideoId(videoId);
    setShowPlaylistModal(true);
    fetchUserPlaylistsForModal();
  };

  const fetchUserPlaylistsForModal = async () => {
    try {
      setPlaylistModalLoading(true);
      const res = await playlistApi.getUserPlaylists(currentUser._id, 1, 50);
      setUserPlaylists(res.data?.playlists || []);
    } catch (err) {
      console.error("Failed to fetch playlists for modal", err);
    } finally {
      setPlaylistModalLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      setPlaylistModalLoading(true);
      await playlistApi.createPlaylist(newPlaylistName, newPlaylistDesc);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      await fetchUserPlaylistsForModal();
      toast.success('Playlist created!');
    } catch (err) {
      toast.error('Failed to create playlist: ' + (err.response?.data?.message || err.message));
      setPlaylistModalLoading(false);
    }
  };

  const handleToggleVideoInPlaylist = async (playlistId, isInPlaylist, playlistName) => {
    try {
      if (isInPlaylist) {
        await playlistApi.removeVideoFromPlaylist(playlistId, playlistTargetVideoId);
        toast.info(`Removed from "${playlistName}"`);
      } else {
        await playlistApi.addVideoToPlaylist(playlistId, playlistTargetVideoId);
        toast.success(`Added to "${playlistName}"!`);
      }
      setUserPlaylists(prev => prev.map(pl => {
        if (pl._id === playlistId) {
          return {
            ...pl,
            videos: isInPlaylist
              ? pl.videos.filter(v => v !== playlistTargetVideoId && v._id !== playlistTargetVideoId)
              : [...pl.videos, playlistTargetVideoId]
          };
        }
        return pl;
      }));
    } catch (err) {
      toast.error('Failed to update playlist: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newTweetContent.trim()) return;
    try {
      setTweetLoading(true);
      await tweetApi.createTweet(newTweetContent);
      setNewTweetContent("");
      const tData = await tweetApi.getUserTweets(profile._id);
      setTweets(tData.data?.tweets || []);
      toast.success('Post published!');
    } catch (err) {
      toast.error('Failed to post: ' + (err.response?.data?.message || err.message));
    } finally {
      setTweetLoading(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (window.confirm("Delete this community post?")) {
      try {
        await tweetApi.deleteTweet(tweetId);
        setTweets(tweets.filter(t => t._id !== tweetId));
      } catch (err) {
        alert("Failed to delete post: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <ChannelSkeleton />;
  if (error) return (
    <div className="error-state" style={{ padding: 60 }}>
      <div className="error-message">{error}</div>
    </div>
  );
  if (!profile) return null;

  return (
    <div className="channel-container">
      {/* Cover Image */}
      <div 
        className="cover-image"
        style={{ backgroundImage: `url(${profile.coverImage || 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=2000'})` }}
      ></div>

      {/* Channel Header */}
      <div className="channel-header glass">
        <div className="channel-info-main">
          <img 
            src={profile.avatar || 'https://i.pravatar.cc/150?img=11'} 
            alt={profile.fullName} 
            className="channel-avatar-huge"
          />
          <div className="channel-details">
            <h1 className="channel-title">{profile.fullName}</h1>
            <p className="channel-handle">@{profile.username}</p>
            <div className="channel-stats">
              <span className="stat-pill"><Users size={16} /> {subscribersCount} subscribers</span>
              <span className="stat-pill">{profile.channelsSubscribedToCount} following</span>
            </div>
          </div>
        </div>

        <div className="channel-actions">
          {currentUser?.username !== profile.username && (
            <button 
              className={`subscribe-btn-large ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="channel-tabs glass">
        <button 
          className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          VIDEOS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          PLAYLISTS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          COMMUNITY
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <div className="no-content glass">This channel has no videos yet.</div>
          ) : (
            <div className="video-grid">
              {videos.map(video => (
                <VideoCard 
                  key={video._id}
                  id={video._id}
                  title={video.title}
                  channelName={profile.fullName}
                  username={profile.username}
                  views={video.views}
                  createdAt={video.createdAt}
                  thumbnail={video.thumbnailfile}
                  avatar={profile.avatar}
                  duration={video.duration}
                  isOwner={currentUser?.username === profile.username}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteVideo}
                  onAddToPlaylist={handleOpenPlaylistModal}
                />
              ))}
            </div>
          )
        )}
        
        {activeTab === 'community' && (
          <div className="community-feed">
            {currentUser?.username === profile.username && (
              <form onSubmit={handleCreateTweet} className="create-tweet-form glass-card">
                <img 
                  src={profile.avatar || 'https://i.pravatar.cc/150'} 
                  alt="Avatar" 
                  className="tweet-input-avatar"
                />
                <div className="tweet-input-wrapper">
                  <textarea 
                    placeholder="What's on your mind? Share an update with your subscribers..."
                    value={newTweetContent}
                    onChange={(e) => setNewTweetContent(e.target.value)}
                    rows={3}
                  />
                  <div className="tweet-input-actions">
                    <button type="submit" disabled={!newTweetContent.trim() || tweetLoading} className="post-btn">
                      <Send size={16} /> {tweetLoading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {tweets.length === 0 ? (
              <div className="no-content glass">This channel hasn't posted any community updates yet.</div>
            ) : (
              <div className="tweets-list">
                {tweets.map(tweet => (
                  <TweetCard 
                    key={tweet._id} 
                    tweet={tweet} 
                    isOwner={currentUser?.username === profile.username}
                    onEdit={(t) => { /* Handle Edit later if needed */ }}
                    onDelete={handleDeleteTweet}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          playlists.length === 0 ? (
            <div className="no-content glass">This channel has no public playlists.</div>
          ) : (
            <div className="playlist-grid">
              {playlists.map(pl => (
                <Link to={`/playlist/${pl._id}`} key={pl._id} className="playlist-card glass-card">
                  <div className="playlist-thumbnail-wrapper">
                    {pl.videos && pl.videos.length > 0 ? (
                      <img src={pl.videos[0].thumbnailfile} alt="Thumbnail" />
                    ) : (
                      <div className="empty-playlist-thumb"><ListVideo size={40} color="var(--text-secondary)" /></div>
                    )}
                    <div className="playlist-video-count">
                      <ListVideo size={16} />
                      {pl.videos?.length || 0} videos
                    </div>
                    <div className="playlist-hover-overlay">
                      <span>PLAY ALL</span>
                    </div>
                  </div>
                  <div className="playlist-info">
                    <h3 className="playlist-title">{pl.name}</h3>
                    <p className="playlist-desc">{pl.description?.substring(0, 50)}{pl.description?.length > 50 ? '...' : ''}</p>
                    <p className="playlist-meta">Updated {new Date(pl.updatedAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Edit Video</h2>
              <button className="close-btn" onClick={() => setEditingVideo(null)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  required 
                  className="edit-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  required 
                  className="edit-textarea"
                  rows={5}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingVideo(null)}>Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content glass playlist-modal">
            <div className="modal-header">
              <h2>Save to Playlist</h2>
              <button className="close-btn" onClick={() => setShowPlaylistModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="playlists-list" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {playlistModalLoading && userPlaylists.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>Loading playlists...</div>
              ) : userPlaylists.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>You don't have any playlists yet.</div>
              ) : (
                userPlaylists.map(pl => {
                  const isInPlaylist = pl.videos.some(v => v === playlistTargetVideoId || v._id === playlistTargetVideoId);
                  return (
                    <div key={pl._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="checkbox" 
                        id={`pl-${pl._id}`} 
                        checked={isInPlaylist}
                        onChange={() => handleToggleVideoInPlaylist(pl._id, isInPlaylist, pl.name)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                      />
                      <label htmlFor={`pl-${pl._id}`} style={{ display: 'flex', justifyContent: 'space-between', flex: 1, cursor: 'pointer', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pl.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Private</span>
                      </label>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}><Plus size={16}/> Create new playlist</h3>
              <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                  className="edit-input"
                />
                <input 
                  type="text" 
                  placeholder="Description (Optional)" 
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="edit-input"
                />
                <button type="submit" className="save-btn" disabled={playlistModalLoading || !newPlaylistName.trim()}>
                  {playlistModalLoading ? 'Creating...' : 'Create'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .channel-container {
          padding: 24px;
          max-width: 1800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cover-image {
          width: 100%;
          height: 250px;
          border-radius: var(--radius-lg);
          background-size: cover;
          background-position: center;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .channel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px;
          border-radius: var(--radius-lg);
          margin-top: -60px;
          position: relative;
          z-index: 10;
        }

        .channel-info-main {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .channel-avatar-huge {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--bg-primary);
        }

        .channel-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .channel-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .channel-handle {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .channel-stats {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .subscribe-btn-large {
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          padding: 12px 32px;
          border-radius: var(--radius-full);
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .subscribe-btn-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }

        .subscribe-btn-large.subscribed {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
        }

        .channel-tabs {
          display: flex;
          padding: 0 24px;
          border-radius: var(--radius-full);
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 16px 32px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          transition: color var(--transition-fast);
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-primary);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-primary);
          border-radius: 3px 3px 0 0;
        }

        .no-content {
          padding: 60px;
          text-align: center;
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .playlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .playlist-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
        }

        .playlist-thumbnail-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: rgba(0,0,0,0.5);
          overflow: hidden;
        }

        .playlist-thumbnail-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .empty-playlist-thumb {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .playlist-video-count {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0,0,0,0.8);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }

        .playlist-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
          font-weight: 600;
          letter-spacing: 1px;
        }

        .playlist-card:hover .playlist-hover-overlay {
          opacity: 1;
        }

        .playlist-card:hover .playlist-thumbnail-wrapper img {
          transform: scale(1.05);
        }

        .playlist-info {
          padding: 16px;
        }

        .playlist-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .playlist-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .playlist-meta {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
        }

        .community-feed {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .create-tweet-form {
          display: flex;
          gap: 16px;
          padding: 24px;
        }

        .tweet-input-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .tweet-input-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tweet-input-wrapper textarea {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 16px;
          color: var(--text-primary);
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .tweet-input-wrapper textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .tweet-input-actions {
          display: flex;
          justify-content: flex-end;
        }

        .post-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background var(--transition-fast);
        }

        .post-btn:hover:not(:disabled) {
          background: var(--accent-secondary);
        }

        .post-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        
        @media (max-width: 768px) {
          .channel-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
          }
          .channel-info-main {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          width: 90%;
          max-width: 600px;
          padding: 32px;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .edit-input, .edit-textarea {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: rgba(0,0,0,0.2);
          color: var(--text-primary);
          font-family: inherit;
        }

        .edit-input:focus, .edit-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .edit-textarea {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }

        .cancel-btn, .save-btn {
          padding: 10px 24px;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-btn {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
        }

        .cancel-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .save-btn {
          background: var(--accent-primary);
          border: none;
          color: white;
        }

        .save-btn:hover {
          background: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
}
