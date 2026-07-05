import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoApi } from '../services/api';
import SearchVideoCard from '../components/SearchVideoCard';
import SearchSkeleton from '../components/skeletons/SearchSkeleton';
import { Filter } from 'lucide-react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search_query') || '';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' or 'views'
  const [sortType, setSortType] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = query ? `VTube — "${query}"` : 'VTube — Search';
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await videoApi.getVideos(1, 20, query, sortBy, sortType);
        setVideos(data.data?.videos || []);
      } catch (err) {
        console.error("Failed to fetch search results", err);
        setError("Failed to load search results.");
      } finally {
        setLoading(false);
      }
    };
    
    if (query) {
      fetchResults();
    } else {
      setVideos([]);
      setLoading(false);
    }
  }, [query, sortBy, sortType]);

  return (
    <div className="search-results-container">
      <div className="results-header">
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel glass">
          <div className="filter-group">
            <h4>Sort by</h4>
            <div className="filter-options">
              <button 
                className={`filter-btn ${sortBy === 'createdAt' ? 'active' : ''}`}
                onClick={() => setSortBy('createdAt')}
              >
                Upload date
              </button>
              <button 
                className={`filter-btn ${sortBy === 'views' ? 'active' : ''}`}
                onClick={() => setSortBy('views')}
              >
                View count
              </button>
            </div>
          </div>
          <div className="filter-group">
            <h4>Order</h4>
            <div className="filter-options">
              <button 
                className={`filter-btn ${sortType === 'desc' ? 'active' : ''}`}
                onClick={() => setSortType('desc')}
              >
                ↓ Newest / Most views first
              </button>
              <button 
                className={`filter-btn ${sortType === 'asc' ? 'active' : ''}`}
                onClick={() => setSortType('asc')}
              >
                ↑ Oldest / Least views first
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <SearchSkeleton count={6} />
      ) : error ? (
        <div className="error-message" style={{ margin: '40px 0' }}>{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No results for "{query}"</div>
          <p className="empty-state-desc">Try different keywords or remove search filters.</p>
        </div>
      ) : (
        <div className="results-list">
          {videos.map(video => (
            <SearchVideoCard 
              key={video._id}
              id={video._id}
              title={video.title}
              channelName={video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown Channel'}
              username={video.ownerDetails?.username || video.owner?.username}
              views={video.views}
              createdAt={video.createdAt}
              thumbnail={video.thumbnailfile}
              avatar={video.ownerDetails?.avatar || video.owner?.avatar}
              description={video.description}
            />
          ))}
        </div>
      )}

      <style>{`
        .search-results-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .results-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 12px;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          transition: background-color var(--transition-fast);
        }

        .filter-toggle:hover {
          background-color: var(--bg-tertiary);
        }

        .filters-panel {
          padding: 24px;
          border-radius: var(--radius-lg);
          margin-bottom: 24px;
          display: flex;
          gap: 48px;
        }

        .filter-group h4 {
          color: var(--text-secondary);
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          text-align: left;
          font-size: 1rem;
          cursor: pointer;
          padding: 4px 0;
          opacity: 0.7;
          transition: opacity var(--transition-fast);
        }

        .filter-btn:hover {
          opacity: 1;
        }

        .filter-btn.active {
          opacity: 1;
          font-weight: 600;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .empty-state h2 {
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .results-list {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
