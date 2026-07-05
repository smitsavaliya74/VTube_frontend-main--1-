import React, { useState, useEffect } from 'react';
import { interactionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentCard from './CommentCard';

export default function Comments({ videoId }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await interactionApi.getVideoComments(videoId);
        setComments(data.data || []);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      setIsSubmitting(true);
      const data = await interactionApi.addComment(videoId, newComment);
      
      const addedComment = {
        ...data.data,
        owner: {
          _id: currentUser._id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        likesCount: 0,
        isLiked: false
      };
      
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = (commentId, newContent) => {
    setComments(comments.map(c => 
      c._id === commentId ? { ...c, content: newContent } : c
    ));
  };

  const handleDelete = (commentId) => {
    setComments(comments.filter(c => c._id !== commentId));
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>{comments.length} Comments</h3>
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="comment-input-container">
          <img 
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=random`} 
            alt="Your avatar" 
            className="current-user-avatar" 
          />
          <div className="comment-input-wrapper">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            {newComment.trim() && (
              <div className="comment-actions">
                <button type="button" onClick={() => setNewComment('')} className="cancel-btn">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  {isSubmitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="login-prompt glass">
          <p>Please log in to leave a comment.</p>
        </div>
      )}

      {loading ? (
        <div className="loading-comments">Loading comments...</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <CommentCard 
              key={comment._id} 
              comment={comment} 
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <style>{`
        .comments-section {
          margin-top: 24px;
        }

        .comments-header h3 {
          font-size: 1.2rem;
          margin-bottom: 24px;
          color: var(--text-primary);
        }

        .comment-input-container {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .current-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment-input-wrapper {
          flex: 1;
        }

        .comment-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--glass-border);
          color: var(--text-primary);
          padding: 8px 0;
          font-size: 1rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .comment-input:focus {
          border-bottom-color: var(--text-primary);
        }

        .comment-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }

        .comment-actions button {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-weight: 500;
          cursor: pointer;
          border: none;
          font-size: 0.9rem;
        }

        .cancel-btn {
          background: transparent;
          color: var(--text-primary);
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .submit-btn {
          background: var(--accent-primary);
          color: white;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-prompt {
          padding: 16px;
          border-radius: var(--radius-md);
          text-align: center;
          margin-bottom: 32px;
        }

        .loading-comments {
          padding: 32px;
          text-align: center;
          color: var(--text-secondary);
        }

        .comments-list {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
