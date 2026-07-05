import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MoreVertical, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tweetApi } from '../services/api';

export default function TweetCard({ tweet, isOwner, onEdit, onDelete }) {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [likesCount, setLikesCount] = useState(tweet.totalLikes || 0);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    if (!currentUser) return alert('Please log in to like this post');
    try {
      // Optimistic UI update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      await tweetApi.toggleTweetLike(tweet._id);
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle tweet like', error);
    }
  };

  return (
    <div className="tweet-card glass-card">
      <div className="tweet-header">
        <div className="tweet-author-info">
          <img 
            src={tweet.owner?.avatar || 'https://i.pravatar.cc/150'} 
            alt={tweet.owner?.fullName} 
            className="tweet-avatar"
          />
          <div>
            <h4 className="tweet-author-name">{tweet.owner?.fullName || 'Unknown'}</h4>
            <span className="tweet-time">@{tweet.owner?.username} • {formatDistanceToNow(new Date(tweet.createdAt))} ago</span>
          </div>
        </div>
        
        {isOwner && (
          <div className="tweet-menu-container">
            <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="tweet-dropdown glass">
                <button onClick={() => { setShowMenu(false); onEdit(tweet); }}><Edit2 size={14} /> Edit</button>
                <button className="danger" onClick={() => { setShowMenu(false); onDelete(tweet._id); }}><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="tweet-content">
        <p>{tweet.content}</p>
      </div>

      <div className="tweet-actions">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`} 
          onClick={handleLike}
        >
          <ThumbsUp size={18} className={isLiked ? 'filled-icon' : ''} />
          <span>{likesCount > 0 ? likesCount : ''}</span>
        </button>
      </div>

      <style>{`
        .tweet-card {
          padding: 20px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
        }

        .tweet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .tweet-author-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .tweet-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(123, 44, 191, 0.3);
        }

        .tweet-author-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
          font-size: 1.05rem;
        }

        .tweet-time {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .tweet-content {
          color: var(--text-primary);
          font-size: 1rem;
          line-height: 1.5;
          white-space: pre-wrap;
          margin: 8px 0;
        }

        .tweet-actions {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          padding: 8px 12px;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .action-btn.liked {
          color: var(--accent-primary);
        }

        .filled-icon {
          fill: currentColor;
        }

        .tweet-menu-container {
          position: relative;
        }

        .tweet-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 150px;
          border-radius: var(--radius-md);
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .tweet-dropdown button {
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background var(--transition-fast);
        }

        .tweet-dropdown button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .tweet-dropdown button.danger {
          color: #ff4b4b;
        }

        .tweet-dropdown button.danger:hover {
          background: rgba(255, 75, 75, 0.1);
        }
      `}</style>
    </div>
  );
}
