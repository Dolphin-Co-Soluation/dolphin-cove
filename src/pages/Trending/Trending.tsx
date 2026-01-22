import { useState } from 'react';
import { 
  TrendingUp, 
  Hash, 
  Flame,
  Inbox
} from 'lucide-react';
import { usePosts } from '../../context/PostContext';
import { PostCard } from '../../components/PostCard/PostCard';
import './Trending.css';

type TimeFilter = 'today' | 'week' | 'month' | 'all';

export function Trending() {
  const { posts } = usePosts();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  // TODO: Replace with real trending data from backend
  const trendingHashtags: unknown[] = [];
  const trendingPosts = posts.slice().sort((a, b) => b.likes.length - a.likes.length);

  return (
    <div className="trending-page">
      {/* Header */}
      <div className="trending-header">
        <div className="header-content">
          <div className="header-icon">
            <TrendingUp size={32} />
          </div>
          <div>
            <h1>What's Trending</h1>
            <p>See what the tech community is talking about</p>
          </div>
        </div>

        <div className="time-filters">
          {(['today', 'week', 'month', 'all'] as TimeFilter[]).map(filter => (
            <button
              key={filter}
              className={`time-filter ${timeFilter === filter ? 'active' : ''}`}
              onClick={() => setTimeFilter(filter)}
            >
              {filter === 'today' ? 'Today' :
               filter === 'week' ? 'This Week' :
               filter === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="trending-content">
        {/* Trending Hashtags */}
        <section className="trending-section">
          <div className="section-header">
            <Hash size={20} />
            <h2>Trending Hashtags</h2>
          </div>
          
          <div className="hashtags-grid">
            {trendingHashtags.length > 0 ? (
              // TODO: Map over real hashtags
              <></>
            ) : (
              <div className="empty-state-inline">
                <Inbox size={32} />
                <p>No trending hashtags yet</p>
              </div>
            )}
          </div>

          {/* Hashtag Card Template */}
          {/*
          <div className="hashtag-card">
            <div className="hashtag-rank">1</div>
            <div className="hashtag-info">
              <h3>#ReactJS</h3>
              <span>2.4k posts today</span>
            </div>
            <div className="hashtag-trend up">
              <TrendingUp size={16} />
              +24%
            </div>
          </div>
          */}
        </section>

        {/* Hot Posts */}
        <section className="trending-section">
          <div className="section-header">
            <Flame size={20} />
            <h2>Hot Posts</h2>
          </div>

          <div className="posts-list">
            {trendingPosts.length > 0 ? (
              trendingPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="empty-state">
                <Inbox size={64} />
                <h3>No Trending Posts Yet</h3>
                <p>Be the first to create engaging content!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="trending-sidebar">
        <div className="sidebar-card">
          <h3>🔥 Today's Hot Topics</h3>
          <div className="topics-list empty">
            <p>No hot topics yet. Start conversations!</p>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>📈 Rising Keywords</h3>
          <div className="keywords-list empty">
            <p>Keywords will appear as the community grows</p>
          </div>
        </div>

        <div className="info-card">
          <h4>How Trending Works</h4>
          <p>Posts and hashtags are ranked based on engagement, recency, and velocity of interactions.</p>
        </div>
      </aside>
    </div>
  );
}
