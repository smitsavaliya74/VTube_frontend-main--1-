import React, { useState, useEffect } from 'react';
import { interactionApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import VideoSkeleton from '../components/VideoSkeleton';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LikedVideos() {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = 'VTube — Liked Videos'; }, []);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const res = await interactionApi.getLikedVideos();
        setVideos(res.data || []);
      } catch (err) {
        console.error("Failed to fetch liked videos:", err);
        setError("Failed to load your liked videos.");
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) fetchLikedVideos();
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="liked-container">
      <div className="liked-header glass">
        <div className="header-icon"><ThumbsUp size={32} color="var(--accent-primary)" /></div>
        <div>
          <h1>Liked Videos</h1>
          <p>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</p>
        </div>
      </div>

      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty-liked glass">
          <ThumbsUp size={64} color="var(--text-secondary)" opacity={0.5} />
          <h2>You haven't liked any videos yet</h2>
          <p>Videos you like will appear here.</p>
        </div>
      ) : (
        <div className="liked-list">
          {videos.map(video => (
            <VideoCard 
              key={video._id}
              id={video._id}
              title={video.title}
              channelName={video.owner?.fullName}
              username={video.owner?.username}
              views={video.views}
              createdAt={video.createdAt}
              thumbnail={video.thumbnailfile}
              avatar={video.owner?.avatar}
              duration={video.duration}
              isOwner={false}
            />
          ))}
        </div>
      )}

      <style>{`
        .liked-container {
          padding: 32px 24px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .liked-header {
          display: flex;
          align-items: center;
          padding: 32px;
          border-radius: var(--radius-lg);
          gap: 24px;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: var(--color-primary-muted);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .liked-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .liked-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .empty-liked {
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          border-radius: var(--radius-lg);
        }

        .empty-liked h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-top: 8px;
        }

        .empty-liked p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .liked-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
      `}</style>
    </div>
  );
}
