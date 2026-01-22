import { Link } from 'react-router-dom';
import { Briefcase, Zap, TrendingUp, ExternalLink, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './RightSidebar.css';

// Empty state component
function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="empty-state">
      <Icon size={24} className="empty-icon" />
      <p>{message}</p>
    </div>
  );
}

export function RightSidebar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  // TODO: Replace with real data from backend
  const jobs: unknown[] = [];
  const suggestedUsers: unknown[] = [];
  const trendingTopics: unknown[] = [];

  return (
    <aside className="right-sidebar">
      {/* Featured Jobs */}
      <div className="sidebar-card">
        <div className="card-header">
          <Briefcase size={18} />
          <h3>Hot Opportunities</h3>
        </div>
        
        <div className="job-list">
          {jobs.length > 0 ? (
            // TODO: Map over real jobs when backend is ready
            <></>
          ) : (
            <EmptyState icon={Inbox} message="No jobs available yet" />
          )}
        </div>
        
        <Link to="/jobs" className="see-all-link">
          Browse all jobs
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Who to Follow */}
      <div className="sidebar-card">
        <div className="card-header">
          <Zap size={18} />
          <h3>Developers to Follow</h3>
        </div>
        
        <div className="follow-list">
          {suggestedUsers.length > 0 ? (
            // TODO: Map over real users when backend is ready
            <></>
          ) : (
            <EmptyState icon={Inbox} message="No suggestions yet" />
          )}
        </div>
        
        <Link to="/network" className="see-all-link">
          Explore network
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Trending Topics */}
      <div className="sidebar-card">
        <div className="card-header">
          <TrendingUp size={18} />
          <h3>Trending in Tech</h3>
        </div>
        
        <div className="trending-list">
          {trendingTopics.length > 0 ? (
            // TODO: Map over real trending data when backend is ready
            <></>
          ) : (
            <EmptyState icon={Inbox} message="No trending topics yet" />
          )}
        </div>
        
        <Link to="/trending" className="see-all-link">
          See what's trending
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Footer Links */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        <p className="copyright">© 2026 Dolphin Cove</p>
      </div>
    </aside>
  );
}
