import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Users, 
  TrendingUp,
  Bookmark,
  Code,
  Waves,
  Star,
  Settings,
  User as UserIcon,
  MessageSquare,
  Bell,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export function Sidebar() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <aside className="sidebar">
      {/* User Profile Card */}
      <div className="sidebar-profile">
        <div className="profile-cover">
          <div className="cover-waves"></div>
        </div>
        <div className="profile-info">
          <div className="avatar-medium">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.displayName} />
            ) : (
              <span>{user?.displayName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <h3>{user?.displayName || 'New User'}</h3>
          <p>@{user?.username || 'username'}</p>
          {user?.isFreelancer && (
            <span className="freelancer-badge">
              <Code size={12} />
              Freelancer
            </span>
          )}
        </div>
        <div className="profile-stats">
          <div className="stat">
            <strong>{user?.connections?.length || 0}</strong>
            <span>Connections</span>
          </div>
          <div className="stat">
            <strong>{user?.projects?.length || 0}</strong>
            <span>Projects</span>
          </div>
          <div className="stat">
            <strong>{user?.rating || '-'}</strong>
            <span>Rating</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home Feed</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <UserIcon size={20} />
          <span>My Profile</span>
        </NavLink>
        <NavLink to="/freelance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Briefcase size={20} />
          <span>Freelance Jobs</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>My Tasks</span>
        </NavLink>
        <NavLink to="/network" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>My Network</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>Messages</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
        <NavLink to="/trending" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <TrendingUp size={20} />
          <span>Trending</span>
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bookmark size={20} />
          <span>Saved Posts</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Your Skills */}
      <div className="sidebar-section">
        <h4>
          <Waves size={16} />
          Your Skills
        </h4>
        <div className="trending-skills">
          {user?.skills && user.skills.length > 0 ? (
            user.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))
          ) : (
            <p className="empty-state-text">Add skills in your profile</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="sidebar-section">
        <h4>
          <Star size={16} />
          Quick Links
        </h4>
        <div className="quick-links">
          <NavLink to="/profile" className="quick-link">View Profile</NavLink>
          <NavLink to="/settings" className="quick-link">Settings</NavLink>
          <NavLink to="/freelance" className="quick-link">Browse Jobs</NavLink>
          <NavLink to="/tasks" className="quick-link">My Tasks</NavLink>
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>© 2026 Dolphin Cove</p>
        <p>Ride the wave of freelance 🌊</p>
      </div>
    </aside>
  );
}
