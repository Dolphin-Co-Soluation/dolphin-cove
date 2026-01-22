import { useState } from 'react';
import { 
  Bookmark, 
  Filter, 
  Trash2, 
  Inbox,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { PostCard } from '../../components/PostCard/PostCard';
import './Saved.css';

type FilterType = 'all' | 'posts' | 'jobs' | 'articles';

export function Saved() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [filter, setFilter] = useState<FilterType>('all');

  // TODO: Replace with real saved items from backend
  // For now, filter posts that user has saved
  const savedPosts = posts.filter(post => 
    user?.savedPosts?.includes(post.id)
  );

  return (
    <div className="saved-page">
      {/* Header */}
      <div className="saved-header">
        <div className="header-content">
          <div className="header-icon">
            <Bookmark size={28} />
          </div>
          <div>
            <h1>Saved Items</h1>
            <p>Your bookmarked posts, jobs, and articles</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="filter-dropdown">
            <Filter size={16} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as FilterType)}
            >
              <option value="all">All Items</option>
              <option value="posts">Posts</option>
              <option value="jobs">Jobs</option>
              <option value="articles">Articles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="saved-content">
        {savedPosts.length > 0 ? (
          <div className="saved-list">
            {savedPosts.map(post => (
              <div key={post.id} className="saved-item">
                <PostCard post={post} />
                <button className="remove-saved" title="Remove from saved">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Inbox size={64} />
            </div>
            <h2>No Saved Items</h2>
            <p>Items you bookmark will appear here for easy access</p>
            <div className="empty-hint">
              <FolderOpen size={18} />
              <span>Click the bookmark icon on any post to save it</span>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="saved-sidebar">
        <div className="stats-card">
          <h3>Saved Summary</h3>
          <div className="stat-row">
            <span>Total Saved</span>
            <strong>{user?.savedPosts?.length || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Posts</span>
            <strong>{savedPosts.length}</strong>
          </div>
          <div className="stat-row">
            <span>Jobs</span>
            <strong>0</strong>
          </div>
          <div className="stat-row">
            <span>Articles</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="tips-card">
          <h4>💡 Quick Tips</h4>
          <ul>
            <li>Bookmark jobs you want to apply to later</li>
            <li>Save helpful tutorials and resources</li>
            <li>Keep track of inspiring projects</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
