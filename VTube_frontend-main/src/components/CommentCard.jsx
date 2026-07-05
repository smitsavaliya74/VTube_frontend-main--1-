import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { interactionApi } from '../services/api';
import { Link } from 'react-router-dom';

export default function CommentCard({ comment, onUpdate, onDelete }) {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser && currentUser._id === comment.owner._id;

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      await interactionApi.toggleCommentLike(comment._id);
    } catch (err) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error("Failed to toggle like", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    try {
      await interactionApi.updateComment(comment._id, editContent);
      onUpdate(comment._id, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setIsDeleting(true);
      await interactionApi.deleteComment(comment._id);
      onDelete(comment._id);
    } catch (err) {
      console.error("Failed to delete comment", err);
      setIsDeleting(false);
    }
  };

  if (isDeleting) return null;

  return (
    <div className="comment-card">
      <Link to={`/channel/${comment.owner.username}`} className="comment-avatar-link">
        <img 
          src={comment.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.owner.fullName)}&background=random`} 
          alt={comment.owner.fullName} 
          className="comment-avatar" 
        />
      </Link>
      
      <div className="comment-content-container">
        <div className="comment-header">
          <Link to={`/channel/${comment.owner.username}`} className="comment-author">
            {comment.owner.fullName}
          </Link>
          <span className="comment-time">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        {isEditing ? (
          <div className="comment-edit-box">
            <input 
              type="text" 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              className="comment-edit-input"
              autoFocus
            />
            <div className="comment-edit-actions">
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveEdit} className="save-btn">Save</button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment.content}</p>
        )}

        <div className="comment-footer">
          <button className={`comment-like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
            <ThumbsUp size={14} className={isLiked ? 'filled' : ''} />
            <span>{likesCount > 0 ? likesCount : ''}</span>
          </button>
        </div>
      </div>

      {isOwner && (
        <div className="comment-menu-container">
          <button className="comment-menu-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="comment-dropdown glass">
              <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                <Edit2 size={14} /> Edit
              </button>
              <button className="delete-action" onClick={() => { handleDelete(); setShowMenu(false); }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .comment-card {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          position: relative;
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment-content-container {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .comment-author {
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.95rem;
        }

        .comment-time {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .comment-text {
          color: var(--text-primary);
          font-size: 0.95rem;
          line-height: 1.4;
          margin: 4px 0 8px 0;
          white-space: pre-wrap;
        }

        .comment-footer {
          display: flex;
          align-items: center;
        }

        .comment-like-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 4px 8px;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .comment-like-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .comment-like-btn.liked {
          color: var(--accent-primary);
        }

        .comment-like-btn .filled {
          fill: var(--accent-primary);
        }

        .comment-edit-box {
          margin: 8px 0;
        }

        .comment-edit-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--text-primary);
          color: var(--text-primary);
          padding: 4px 0;
          font-size: 0.95rem;
          outline: none;
          margin-bottom: 8px;
        }

        .comment-edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .comment-edit-actions button {
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .cancel-btn {
          background: transparent;
          color: var(--text-primary);
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .save-btn {
          background: var(--accent-primary);
          color: white;
        }

        .comment-menu-container {
          position: relative;
        }

        .comment-menu-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
        }

        .comment-menu-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .comment-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          min-width: 120px;
          border-radius: var(--radius-md);
          overflow: hidden;
          z-index: 10;
          display: flex;
          flex-direction: column;
        }

        .comment-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.9rem;
          text-align: left;
        }

        .comment-dropdown button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .delete-action {
          color: #ff4d4d !important;
        }
      `}</style>
    </div>
  );
}
