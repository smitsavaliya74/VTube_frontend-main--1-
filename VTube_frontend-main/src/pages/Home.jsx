import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import VideoSkeleton from '../components/VideoSkeleton';
import { videoApi } from '../services/api';

const CATEGORIES = ['All','Gaming','Music','Coding','Podcasts','News','Education','Sports'];

export default function Home() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const observer = useRef();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Document title
  useEffect(() => { document.title = 'VTube — Home'; }, []);

  // Back-to-top visibility
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Reset on query/category change
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [query, activeCategory]);

  useEffect(() => {
    // If page is not 1 and there's no more data, abort.
    // By always allowing page === 1 to fetch, we prevent the stale 'hasMore' race condition bug.
    if (!hasMore && page !== 1) return;
    
    const fetchVideos = async () => {
      try {
        if (page === 1) setLoading(true);
        
        // Pass the category as a search query to filter videos in the backend
        const searchQuery = query ? query : (activeCategory !== 'All' ? activeCategory : '');
        
        const data = await videoApi.getVideos(page, 12, searchQuery);
        const fetched = data.data?.videos || [];
        
        setVideos(prev => page === 1 ? fetched : [...prev, ...fetched]);
        if (fetched.length < 12) setHasMore(false);
      } catch (err) {
        console.error("Home video fetch error:", err);
        setError(`Failed to load videos. Error: ${err.message || JSON.stringify(err)}`);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [query, activeCategory, page]);

  // Infinite scroll observer
  const lastVideoRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(p => p + 1);
    }, { rootMargin: '200px' });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="home-container animate-fade-in">
      {/* Category pills */}
      <div className="categories-bar" role="tablist" aria-label="Video categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            role="tab"
            aria-selected={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="error-message" style={{ marginBottom: 24 }}>{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && videos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📹</div>
          <div className="empty-state-title">No videos found</div>
          <p className="empty-state-desc">
            {query ? `No results for "${query}". Try a different search.` : 'Be the first to upload a video!'}
          </p>
        </div>
      )}

      {/* Video grid */}
      {(videos.length > 0 || loading) && (
        <div className="video-grid">
          {videos.map((video, index) => {
            const isLast = index === videos.length - 1;
            return (
              <div ref={isLast ? lastVideoRef : null} key={video._id}>
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
            );
          })}
          {/* Skeleton placeholders */}
          {loading && [...Array(12)].map((_, i) => <VideoSkeleton key={`sk-${i}`} />)}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && videos.length > 0 && (
        <div className="end-of-feed">
          <span>·</span> You've reached the end <span>·</span>
        </div>
      )}

      {/* Back to top */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <ChevronUp size={22} />
        </button>
      )}
    </div>
  );
}
