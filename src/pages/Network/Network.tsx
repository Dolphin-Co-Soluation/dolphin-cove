import { useState } from 'react';
import { 
  Search, 
  Users, 
  UserPlus, 
  UserCheck,
  Inbox,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Network.css';

type TabType = 'connections' | 'pending' | 'suggestions';

export function Network() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with real data from backend
  const connections: unknown[] = [];
  const pendingRequests: unknown[] = [];
  const suggestions: unknown[] = [];

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'connections': return user?.connections?.length || 0;
      case 'pending': return pendingRequests.length;
      case 'suggestions': return suggestions.length;
    }
  };

  return (
    <div className="network-page">
      {/* Header */}
      <div className="network-header">
        <div className="header-left">
          <h1>My Network</h1>
          <p>Connect with fellow developers and expand your professional circle</p>
        </div>
        
        <div className="header-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="network-tabs">
        <button
          className={`tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <UserCheck size={18} />
          Connections
          <span className="tab-count">{getTabCount('connections')}</span>
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <UserPlus size={18} />
          Pending
          <span className="tab-count">{getTabCount('pending')}</span>
        </button>
        <button
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          <Globe size={18} />
          Discover
          <span className="tab-count">{getTabCount('suggestions')}</span>
        </button>
      </div>

      {/* Content */}
      <div className="network-content">
        {activeTab === 'connections' && (
          <div className="connections-grid">
            {connections.length > 0 ? (
              // TODO: Map over real connections
              <></>
            ) : (
              <div className="empty-state">
                <Users size={64} />
                <h2>No Connections Yet</h2>
                <p>Start building your network by connecting with other developers</p>
                <button className="btn-primary" onClick={() => setActiveTab('suggestions')}>
                  <Globe size={16} />
                  Discover People
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-section">
            {pendingRequests.length > 0 ? (
              // TODO: Map over real pending requests
              <></>
            ) : (
              <div className="empty-state">
                <UserPlus size={64} />
                <h2>No Pending Requests</h2>
                <p>Connection requests you send or receive will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-section">
            {suggestions.length > 0 ? (
              // TODO: Map over real suggestions
              <></>
            ) : (
              <div className="empty-state">
                <Inbox size={64} />
                <h2>No Suggestions Yet</h2>
                <p>We'll suggest developers to connect with based on your profile and interests</p>
                <p className="empty-hint">Complete your profile to get better suggestions!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Card Template (for future use) */}
      {/*
      <div className="connection-card">
        <div className="card-avatar">
          <img src="" alt="" />
        </div>
        <div className="card-info">
          <h3>User Name</h3>
          <p>@username</p>
          <span className="user-title">Full Stack Developer</span>
          <div className="user-skills">
            <span>React</span>
            <span>Node.js</span>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn-secondary">
            <MessageSquare size={16} />
            Message
          </button>
          <button className="btn-icon">
            <UserMinus size={18} />
          </button>
        </div>
      </div>
      */}

      {/* Sidebar Stats */}
      <aside className="network-sidebar">
        <div className="stats-card">
          <h3>Network Stats</h3>
          <div className="stat-row">
            <span>Total Connections</span>
            <strong>{user?.connections?.length || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Followers</span>
            <strong>{user?.followers?.length || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Following</span>
            <strong>{user?.following?.length || 0}</strong>
          </div>
        </div>

        <div className="tips-card">
          <h4>🌊 Grow Your Network</h4>
          <ul>
            <li>Complete your profile with skills and bio</li>
            <li>Engage with posts in your feed</li>
            <li>Join discussions on trending topics</li>
            <li>Share your projects and experiences</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
