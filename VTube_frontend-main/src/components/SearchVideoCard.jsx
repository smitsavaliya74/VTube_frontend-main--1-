import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Play } from 'lucide-react';

export default function SearchVideoCard({ id, title, channelName, username, views, createdAt, thumbnail, avatar, description }) {
  return (
    <div className="search-card">
      <Link to={`/video/${id}`} className="search-thumbnail-container">
        <img src={thumbnail} alt={title} className="search-thumbnail" />
        <div className="search-play-overlay">
          <Play size={40} fill="white" />
        </div>
      </Link>
      
      <div className="search-info">
        <Link to={`/video/${id}`} className="search-title">
          <h3>{title}</h3>
        </Link>
        
        <div className="search-meta">
          <span>{views || 0} views</span>
          <span className="dot">•</span>
          <span>{createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 'Just now'}</span>
        </div>
        
        <Link to={`/channel/${username}`} className="search-channel">
          <img src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=random`} alt={channelName} className="search-avatar" />
          <span className="search-channel-name">{channelName}</span>
        </Link>
        
        {description && (
          <p className="search-description">
            {description.length > 150 ? description.substring(0, 150) + '...' : description}
          </p>
        )}
      </div>

      <style>{`
        .search-card {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding: 16px;
          border-radius: var(--radius-lg);
          transition: background-color var(--transition-fast);
        }
        
        .search-card:hover {
          background-color: var(--bg-tertiary);
        }

        .search-thumbnail-container {
          position: relative;
          width: 400px;
          min-width: 400px;
          aspect-ratio: 16/9;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #000;
        }

        .search-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-medium);
        }

        .search-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .search-card:hover .search-thumbnail {
          transform: scale(1.05);
        }

        .search-card:hover .search-play-overlay {
          opacity: 1;
        }

        .search-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .search-title h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
          line-height: 1.4;
          font-weight: 500;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .search-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .search-channel {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0;
          text-decoration: none;
          transition: opacity var(--transition-fast);
        }

        .search-channel:hover {
          opacity: 0.8;
        }

        .search-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .search-channel-name {
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .search-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .search-card {
            flex-direction: column;
            padding: 0;
          }
          .search-thumbnail-container {
            width: 100%;
            min-width: 100%;
          }
          .search-info {
            padding: 8px 0;
          }
        }
      `}</style>
    </div>
  );
}
