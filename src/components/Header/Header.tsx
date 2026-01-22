import { Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import logo from '../../assets/Dolphin-cove.png';
import './Header.css';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to={isAuthenticated ? "/home" : "/"} className="header-logo">
          <img src={logo} alt="Dolphin Cove" className="logo-image" />
          <span className="logo-text">Dolphin Cove</span>
        </Link>

        {/* Search Bar */}
        {isAuthenticated && (
          <div className="header-search">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search freelancers, projects, skills..." 
              className="search-input"
            />
          </div>
        )}

        {/* Navigation */}
        <nav className={`header-nav ${showMobileMenu ? 'show' : ''}`}>
          {isAuthenticated ? (
            <>
              {/* Theme Toggle */}
              <button 
                className="nav-icon-btn theme-toggle" 
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>

              <Link to="/messages" className="nav-icon-btn" title="Messages">
                <MessageCircle size={22} />
              </Link>
              
              <Link to="/notifications" className="nav-icon-btn" title="Notifications">
                <Bell size={22} />
              </Link>

              <div className="profile-dropdown">
                <button 
                  className="profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="avatar-small">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.displayName} />
                    ) : (
                      <span>{user?.displayName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user?.displayName}</strong>
                      <span>@{user?.username}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={logout}>
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <button 
                className="nav-icon-btn theme-toggle" 
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <Link to="/login" className="btn btn-ghost">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
