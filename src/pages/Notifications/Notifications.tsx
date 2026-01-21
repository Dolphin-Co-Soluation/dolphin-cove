import { useState } from 'react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Briefcase,
  CheckCheck,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Notifications.css';

type TabType = 'all' | 'mentions' | 'jobs' | 'network';

export function Notifications() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // TODO: Replace with real data from backend
  const notifications: unknown[] = [];

  const markAllAsRead = () => {
    // TODO: Mark all notifications as read in backend
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          <p>Stay updated with your network activity</p>
        </div>
        
        <div className="header-actions">
          <button className="mark-read-btn" onClick={markAllAsRead}>
            <CheckCheck size={16} />
            Mark all as read
          </button>
          <Link to="/settings" className="settings-btn">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="notification-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Bell size={16} />
          All
        </button>
        <button
          className={`tab ${activeTab === 'mentions' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentions')}
        >
          <MessageCircle size={16} />
          Mentions
        </button>
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={16} />
          Jobs
        </button>
        <button
          className={`tab ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <UserPlus size={16} />
          Network
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-content">
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {/* TODO: Map over real notifications */}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Bell size={64} />
            </div>
            <h2>No Notifications Yet</h2>
            <p>When you get notifications, they'll show up here</p>
            <div className="empty-examples">
              <div className="example-item">
                <Heart size={20} />
                <span>When someone likes your post</span>
              </div>
              <div className="example-item">
                <MessageCircle size={20} />
                <span>When someone comments on your post</span>
              </div>
              <div className="example-item">
                <UserPlus size={20} />
                <span>When someone follows you</span>
              </div>
              <div className="example-item">
                <Briefcase size={20} />
                <span>When there's a matching job</span>
              </div>
            </div>
          </div>
        )}

        {/* Notification Item Template */}
        {/*
        <div className="notification-item unread">
          <div className="notification-icon like">
            <Heart size={18} />
          </div>
          <div className="notification-content">
            <div className="notification-avatar">
              <img src="" alt="" />
            </div>
            <div className="notification-text">
              <p><strong>User Name</strong> liked your post about React hooks</p>
              <span className="notification-time">2 hours ago</span>
            </div>
          </div>
          <button className="notification-action">
            <MoreVertical size={16} />
          </button>
        </div>
        */}
      </div>

      {/* Sidebar */}
      <aside className="notifications-sidebar">
        <div className="settings-card">
          <h3>Notification Settings</h3>
          <p>Customize what notifications you receive</p>
          <Link to="/settings" className="btn-secondary">
            <Settings size={16} />
            Manage Settings
          </Link>
        </div>

        <div className="quick-filters">
          <h4>Quick Filters</h4>
          <div className="filter-options">
            <label className="filter-option">
              <input type="checkbox" defaultChecked />
              <span>Likes</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" defaultChecked />
              <span>Comments</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" defaultChecked />
              <span>Follows</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" defaultChecked />
              <span>Job Alerts</span>
            </label>
          </div>
        </div>
      </aside>
    </div>
  );
}
