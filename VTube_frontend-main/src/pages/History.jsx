import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import VideoCard from '../components/VideoCard';
import VideoSkeleton from '../components/VideoSkeleton';
import { History as HistoryIcon, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function History() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { document.title = 'VTube — Watch History'; }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await userApi.getWatchHistory();
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to fetch watch history:", err);
        setError("Failed to load your watch history.");
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) fetchHistory();
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/login" />;

  const filteredHistory = history.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.owner?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-container">
      <div className="history-header glass">
        <div className="header-left">
          <div className="header-icon"><HistoryIcon size={32} color="var(--accent-primary)" /></div>
          <div>
            <h1>Watch History</h1>
            <p>Keep track of all the videos you've watched</p>
          </div>
        </div>
        
        {history.length > 0 && (
          <div className="history-search">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search your history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : history.length === 0 ? (
        <div className="empty-history glass">
          <HistoryIcon size={64} color="var(--text-secondary)" opacity={0.5} />
          <h2>You have no watch history</h2>
          <p>Videos you watch will appear here.</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-history glass">
          <h2>No matching videos</h2>
          <p>Try searching for something else.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((video, index) => (
            <div key={`${video._id}-${index}`} className="history-item">
              <VideoCard 
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
            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-container {
          padding: 32px 24px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px;
          border-radius: var(--radius-lg);
          gap: 24px;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
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

        .header-left h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .header-left p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .history-search {
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          padding: 10px 20px;
          min-width: 300px;
        }

        .history-search .search-icon {
          color: var(--text-secondary);
          margin-right: 12px;
        }

        .history-search input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
        }

        .empty-history {
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          border-radius: var(--radius-lg);
        }

        .empty-history h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-top: 8px;
        }

        .empty-history p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .history-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .history-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .history-search {
            width: 100%;
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
}
