import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VideoCard from '../components/VideoCard';
import { Trash2, PlayCircle, ListVideo, Edit2, X, Check, AlertTriangle } from 'lucide-react';

export default function Playlist() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      const res = await playlistApi.getPlaylistById(playlistId);
      setPlaylist(res.data);
      setEditName(res.data.name);
      setEditDescription(res.data.description);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await playlistApi.removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist({
        ...playlist,
        videos: playlist.videos.filter(v => v._id !== videoId)
      });
      toast.success('Video removed from playlist.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove video');
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.warning('Playlist name cannot be empty.');
      return;
    }
    
    try {
      setSaving(true);
      const res = await playlistApi.updatePlaylist(playlistId, editName, editDescription);
      setPlaylist({
        ...playlist,
        name: res.data.name,
        description: res.data.description
      });
      setIsEditing(false);
      toast.success('Playlist updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update playlist');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description);
    setIsEditing(false);
  };

  const handleDeletePlaylist = async () => {
    try {
      await playlistApi.deletePlaylist(playlistId);
      toast.success('Playlist deleted.');
      navigate(`/channel/${currentUser.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete playlist');
      setConfirmDelete(false);
    }
  };

  if (loading) return <div className="loader">Loading Playlist...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!playlist) return null;

  const isOwner = currentUser?._id === playlist.owner;

  return (
    <div className="playlist-page animate-fade-in">
      <div className="playlist-sidebar glass">
        <div className="playlist-thumbnail-large">
          {playlist.videos && playlist.videos.length > 0 ? (
            <img src={playlist.videos[0].thumbnailfile} alt="Playlist Thumbnail" />
          ) : (
            <div className="empty-thumbnail">
              <ListVideo size={48} color="var(--text-secondary)" />
            </div>
          )}
          <div className="play-overlay">
            <PlayCircle size={48} />
            <span>PLAY ALL</span>
          </div>
        </div>

        {isEditing ? (
          <div className="edit-form glass-card">
            <input 
              type="text" 
              className="edit-input" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              placeholder="Playlist name"
              maxLength={50}
              autoFocus
            />
            <textarea 
              className="edit-textarea" 
              value={editDescription} 
              onChange={(e) => setEditDescription(e.target.value)} 
              placeholder="Add a description..."
              rows={4}
              maxLength={200}
            />
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : <><Check size={18} /> Save</>}
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit} disabled={saving}>
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="playlist-title-row">
              <h1 className="playlist-title">{playlist.name}</h1>
              {isOwner && (
                <button className="edit-icon-btn" onClick={() => setIsEditing(true)} title="Edit Playlist">
                  <Edit2 size={18} />
                </button>
              )}
            </div>
            <p className="playlist-description">{playlist.description}</p>
          </>
        )}

        <div className="playlist-stats">
          <span>{playlist.videos ? playlist.videos.length : 0} videos</span>
          <span>•</span>
          <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
        </div>
        
        {isOwner && (
          <div className="playlist-actions">
            {confirmDelete ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <AlertTriangle size={16} /> Delete permanently?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="delete-playlist-btn" onClick={handleDeletePlaylist} style={{ flex: 1 }}>
                    <Trash2 size={16} /> Yes, Delete
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', padding: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="delete-playlist-btn" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={20} />
                Delete Playlist
              </button>
            )}
          </div>
        )}
      </div>

      <div className="playlist-content">
        {(!playlist.videos || playlist.videos.length === 0) ? (
          <div className="empty-playlist glass">
            <h2>This playlist is empty</h2>
            <p>Add videos from the video player page to see them here.</p>
          </div>
        ) : (
          <div className="playlist-videos">
            {playlist.videos.map((video, index) => (
              <div key={video._id} className="playlist-video-item glass">
                <span className="video-index">{index + 1}</span>
                <div className="video-card-wrapper" onClick={() => navigate(`/video/${video._id}`)}>
                  <VideoCard 
                    id={video._id}
                    title={video.title}
                    channelName={video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown'}
                    username={video.ownerDetails?.username || video.owner?.username}
                    views={video.views}
                    createdAt={video.createdAt}
                    thumbnail={video.thumbnailfile}
                    avatar={video.ownerDetails?.avatar || video.owner?.avatar}
                    duration={video.duration}
                  />
                </div>
                {isOwner && (
                  <button 
                    className="remove-video-btn" 
                    title="Remove from playlist"
                    onClick={(e) => { e.stopPropagation(); handleRemoveVideo(video._id); }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .playlist-page {
          display: flex;
          gap: 32px;
          padding: 32px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .playlist-sidebar {
          width: 360px;
          flex-shrink: 0;
          padding: 24px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-self: flex-start;
          position: sticky;
          top: 100px;
        }

        .playlist-thumbnail-large {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          background: rgba(0,0,0,0.5);
        }

        .playlist-thumbnail-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .empty-thumbnail {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
          color: white;
          font-weight: 600;
        }

        .playlist-thumbnail-large:hover .play-overlay {
          opacity: 1;
        }

        .playlist-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .playlist-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          word-break: break-word;
          margin: 0;
        }

        .edit-icon-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .edit-icon-btn:hover {
          background: var(--accent-primary);
          color: white;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          margin-bottom: 8px;
        }

        .edit-input, .edit-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          padding: 12px;
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .edit-input:focus, .edit-textarea:focus {
          border-color: var(--accent-primary);
        }

        .edit-textarea {
          resize: vertical;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .save-btn, .cancel-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: none;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .save-btn {
          background: var(--accent-primary);
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--accent-secondary);
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .save-btn:disabled, .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .playlist-description {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.5;
          margin: 0;
        }

        .playlist-stats {
          display: flex;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .playlist-actions {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }

        .delete-playlist-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.3);
          padding: 12px;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-playlist-btn:hover {
          background: rgba(255, 71, 87, 0.1);
        }

        .playlist-content {
          flex: 1;
        }

        .empty-playlist {
          padding: 60px;
          text-align: center;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-playlist h2 {
          color: var(--text-primary);
        }

        .empty-playlist p {
          color: var(--text-secondary);
        }

        .playlist-videos {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .playlist-video-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: var(--radius-md);
          transition: background 0.2s;
          position: relative;
        }

        .playlist-video-item:hover {
          background: rgba(255,255,255,0.05);
        }

        .video-index {
          color: var(--text-secondary);
          font-weight: 500;
          width: 24px;
          text-align: right;
        }

        .video-card-wrapper {
          flex: 1;
          cursor: pointer;
        }

        /* Override VideoCard styles to make it horizontal in playlist view */
        .playlist-video-item .video-card {
          flex-direction: row;
          height: 120px;
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .playlist-video-item .video-thumbnail-container {
          width: 210px;
          flex-shrink: 0;
          height: 100%;
          border-radius: var(--radius-sm);
        }

        .playlist-video-item .video-info {
          padding: 0 16px;
        }

        .playlist-video-item .channel-avatar {
          display: none;
        }

        .remove-video-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 12px;
          border-radius: 50%;
          transition: all 0.2s;
          opacity: 0;
        }

        .playlist-video-item:hover .remove-video-btn {
          opacity: 1;
        }

        .remove-video-btn:hover {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
        }

        .loader {
          text-align: center;
          padding: 100px;
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .playlist-page {
            flex-direction: column;
          }
          .playlist-sidebar {
            width: 100%;
            position: static;
          }
          .playlist-video-item .video-card {
            flex-direction: column;
            height: auto;
          }
          .playlist-video-item .video-thumbnail-container {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
