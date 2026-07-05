import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ListPlus } from 'lucide-react';

/** Format seconds to M:SS */
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

/** Format relative time */
function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60)      return `${diff}s ago`;
  if (diff < 3600)    return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
  if (diff < 31536000)return `${Math.floor(diff/2592000)}mo ago`;
  return `${Math.floor(diff/31536000)}y ago`;
}

/** Format view count (e.g. 1.2K, 3.4M) */
function formatViews(views) {
  if (!views && views !== 0) return '0';
  if (views >= 1_000_000) return `${(views/1_000_000).toFixed(1)}M`;
  if (views >= 1_000)     return `${(views/1_000).toFixed(1)}K`;
  return String(views);
}

export default function VideoCard({
  id, title, channelName, username, views, createdAt,
  thumbnail, avatar, duration,
  isOwner, onEdit, onDelete, onAddToPlaylist
}) {
  const navigate = useNavigate();

  const handleChannelClick = (e) => {
    e.stopPropagation();
    if (username) navigate(`/channel/${username}`);
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName || 'U')}&background=2563eb&color=fff&size=64`;

  return (
    <article
      className="video-card animate-fade-in"
      onClick={() => navigate(`/video/${id}`)}
      role="article"
      aria-label={`Video: ${title}`}
    >
      {/* ── Thumbnail ── */}
      <div className="thumbnail-container">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800'}
          alt={title}
          className="thumbnail"
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800'; }}
        />
        <div className="duration-badge" aria-label={`Duration: ${formatDuration(duration)}`}>
          {formatDuration(duration)}
        </div>

        {isOwner && (
          <div className="owner-actions" onClick={e => e.stopPropagation()}>
            {onAddToPlaylist && (
              <button
                className="owner-btn"
                onClick={() => onAddToPlaylist(id)}
                title="Add to Playlist"
                aria-label="Add to playlist"
              >
                <ListPlus size={15} />
              </button>
            )}
            <button
              className="owner-btn edit-btn"
              onClick={() => onEdit?.(id)}
              title="Edit Video"
              aria-label="Edit video"
            >
              <Edit2 size={15} />
            </button>
            <button
              className="owner-btn delete-btn"
              onClick={() => onDelete?.(id)}
              title="Delete Video"
              aria-label="Delete video"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="video-info">
        <img
          src={avatar || fallbackAvatar}
          alt={channelName}
          className="channel-avatar"
          onClick={handleChannelClick}
          onError={e => { e.target.src = fallbackAvatar; }}
          aria-label={`${channelName}'s channel`}
        />
        <div className="video-details">
          <h3 className="video-title">{title}</h3>
          <div className="channel-name" onClick={handleChannelClick} role="link" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleChannelClick(e)}>
            {channelName}
          </div>
          <div className="video-stats">
            {formatViews(views)} views · {formatTimeAgo(createdAt)}
          </div>
        </div>
      </div>
    </article>
  );
}
