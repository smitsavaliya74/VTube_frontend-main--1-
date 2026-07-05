import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import VideoSkeleton from '../components/VideoSkeleton';
import { PlaySquare } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Subscriptions() {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = 'VTube — Subscriptions'; }, []);

  useEffect(() => {
    const fetchSubscribedVideos = async () => {
      try {
        setLoading(true);
        const data = await subscriptionApi.getSubscribedChannelsVideos(1, 20);
        setVideos(data.data?.videos || []);
        
        const channelData = await subscriptionApi.getSubscribedChannels(currentUser._id);
        setChannels(channelData.data?.subscriptions || []);
      } catch (err) {
        console.error("Failed to fetch subscriptions feed", err);
        setError("Failed to load your subscriptions feed.");
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchSubscribedVideos();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="home-container">
      <div className="header-section glass">
        <h1 className="page-title"><PlaySquare size={28} /> Subscriptions Feed</h1>
      </div>

      {channels.length > 0 && (
        <div className="subscribed-channels-row glass-card">
          {channels.map((sub) => (
            <Link to={`/channel/${sub.channel.username}`} key={sub._id} className="channel-bubble">
              <img src={sub.channel.avatar || 'https://i.pravatar.cc/150'} alt={sub.channel.fullName} />
              <span>{sub.channel.fullName}</span>
            </Link>
          ))}
        </div>
      )}
      
      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="error-message" style={{ margin: '20px 0' }}>{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <PlaySquare size={48} className="empty-icon" />
          <h2>You haven't subscribed to any channels yet!</h2>
          <p>Discover new creators and subscribe to see their videos here.</p>
          <Link to="/" className="browse-btn">Browse Videos</Link>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard 
              key={video._id}
              id={video._id}
              title={video.title}
              channelName={video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown Channel'}
              username={video.ownerDetails?.username || video.owner?.username}
              views={video.views}
              createdAt={video.createdAt}
              thumbnail={video.thumbnailfile}
              avatar={video.ownerDetails?.avatar || video.owner?.avatar}
              duration={video.duration}
            />
          ))}
        </div>
      )}

      <style>{`
        .home-container {
          padding: 24px;
          max-width: 1800px;
          margin: 0 auto;
        }
        
        .header-section {
          padding: 16px 24px;
          border-radius: var(--radius-md);
          margin-bottom: 32px;
          display: flex;
          align-items: center;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .subscribed-channels-row {
          display: flex;
          gap: 24px;
          padding: 24px;
          overflow-x: auto;
          margin-bottom: 32px;
          border-radius: var(--radius-lg);
          scrollbar-width: none; /* Firefox */
        }

        .subscribed-channels-row::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }

        .channel-bubble {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-primary);
          transition: transform var(--transition-fast);
          min-width: 80px;
        }

        .channel-bubble:hover {
          transform: translateY(-4px);
        }

        .channel-bubble img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid transparent;
          transition: border-color var(--transition-fast);
        }

        .channel-bubble:hover img {
          border-color: var(--color-primary);
        }

        .channel-bubble span {
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 80px;
          text-align: center;
        }
        
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          text-align: center;
          gap: 16px;
        }

        .empty-icon {
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .browse-btn {
          background: var(--text-primary);
          color: var(--bg-primary);
          padding: 10px 24px;
          border-radius: var(--radius-full);
          text-decoration: none;
          font-weight: 600;
          margin-top: 16px;
          transition: opacity var(--transition-fast);
        }

        .browse-btn:hover {
          opacity: 0.9;
        }

        /* Staggered animation delays for the grid items */
        .video-grid > *:nth-child(1) { animation-delay: 0.1s; }
        .video-grid > *:nth-child(2) { animation-delay: 0.2s; }
        .video-grid > *:nth-child(3) { animation-delay: 0.3s; }
        .video-grid > *:nth-child(4) { animation-delay: 0.4s; }
        .video-grid > *:nth-child(5) { animation-delay: 0.5s; }
        .video-grid > *:nth-child(6) { animation-delay: 0.6s; }
        .video-grid > *:nth-child(7) { animation-delay: 0.7s; }
        .video-grid > *:nth-child(8) { animation-delay: 0.8s; }
      `}</style>
    </div>
  );
}
