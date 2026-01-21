import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Users, 
  TrendingUp,
  Bookmark,
  Code,
  Waves,
  Star
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
          <h3>{user?.displayName}</h3>
          <p>@{user?.username}</p>
          {user?.isFreelancer && (
            <span className="freelancer-badge">
              <Code size={12} />
              Freelancer
            </span>
          )}
        </div>
        <div className="profile-stats">
          <div className="stat">
            <strong>124</strong>
            <span>Connections</span>
          </div>
          <div className="stat">
            <strong>48</strong>
            <span>Projects</span>
          </div>
          <div className="stat">
            <strong>4.9</strong>
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
        <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Briefcase size={20} />
          <span>Freelance Jobs</span>
          <span className="nav-badge">12</span>
        </NavLink>
        <NavLink to="/network" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>My Network</span>
        </NavLink>
        <NavLink to="/trending" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <TrendingUp size={20} />
          <span>Trending</span>
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bookmark size={20} />
          <span>Saved Posts</span>
        </NavLink>
      </nav>

      {/* Trending Skills */}
      <div className="sidebar-section">
        <h4>
          <Waves size={16} />
          Trending Skills
        </h4>
        <div className="trending-skills">
          <span className="skill-tag">React</span>
          <span className="skill-tag">TypeScript</span>
          <span className="skill-tag">Node.js</span>
          <span className="skill-tag">Python</span>
          <span className="skill-tag">AWS</span>
          <span className="skill-tag">Rust</span>
        </div>
      </div>

      {/* Top Freelancers */}
      <div className="sidebar-section">
        <h4>
          <Star size={16} />
          Rising Developers
        </h4>
        <div className="top-freelancers">
          <div className="freelancer-item">
            <div className="avatar-tiny">C</div>
            <div className="freelancer-info">
              <span className="name">Coral Coder</span>
              <span className="specialty">Backend Dev</span>
            </div>
          </div>
          <div className="freelancer-item">
            <div className="avatar-tiny">W</div>
            <div className="freelancer-info">
              <span className="name">Wave Maker</span>
              <span className="specialty">UI/UX Designer</span>
            </div>
          </div>
          <div className="freelancer-item">
            <div className="avatar-tiny">D</div>
            <div className="freelancer-info">
              <span className="name">Deep Diver</span>
              <span className="specialty">DevOps Engineer</span>
            </div>
          </div>
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
