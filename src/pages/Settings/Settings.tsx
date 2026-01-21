import { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'appearance' | 'security' | 'billing' | 'help';

export function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  
  // Form states
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    hourlyRate: user?.hourlyRate || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    messageNotifications: true,
    followNotifications: true,
    commentNotifications: true,
    weeklyDigest: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showHourlyRate: true,
    allowMessages: 'everyone',
    showOnlineStatus: true,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAccount = () => {
    // TODO: Save to backend
    updateUser({
      displayName: formData.displayName,
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
    });
    alert('Profile updated! (Changes will persist when backend is connected)');
  };

  const tabs = [
    { id: 'account' as SettingsTab, label: 'Account', icon: User },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
    { id: 'security' as SettingsTab, label: 'Security', icon: Lock },
    { id: 'billing' as SettingsTab, label: 'Billing', icon: CreditCard },
    { id: 'help' as SettingsTab, label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <h2>Settings</h2>
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="chevron" />
              </button>
            ))}
          </nav>
          
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-section">
              <h3>Account Settings</h3>
              <p className="section-description">Manage your personal information</p>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your display name"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <div className="input-with-prefix">
                  <span>@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div className="form-group">
                  <label>Website / Portfolio</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>

              {user?.isFreelancer && (
                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="75"
                    min="0"
                  />
                </div>
              )}

              <button className="btn-primary save-btn" onClick={handleSaveAccount}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy Settings</h3>
              <p className="section-description">Control who can see your information</p>

              <div className="setting-item">
                <div className="setting-info">
                  <Globe size={20} />
                  <div>
                    <h4>Profile Visibility</h4>
                    <p>Choose who can see your profile</p>
                  </div>
                </div>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                >
                  <option value="public">Public</option>
                  <option value="connections">Connections Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Mail size={20} />
                  <div>
                    <h4>Show Email</h4>
                    <p>Display your email on your profile</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showEmail}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <CreditCard size={20} />
                  <div>
                    <h4>Show Hourly Rate</h4>
                    <p>Display your rate on your profile</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showHourlyRate}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showHourlyRate: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Eye size={20} />
                  <div>
                    <h4>Online Status</h4>
                    <p>Show when you're online</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, showOnlineStatus: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <p className="section-description">Choose how you want to be notified</p>

              <div className="setting-item">
                <div className="setting-info">
                  <Mail size={20} />
                  <div>
                    <h4>Email Notifications</h4>
                    <p>Receive notifications via email</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Smartphone size={20} />
                  <div>
                    <h4>Push Notifications</h4>
                    <p>Receive push notifications</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Bell size={20} />
                  <div>
                    <h4>Job Alerts</h4>
                    <p>Get notified about new job opportunities</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.jobAlerts}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, jobAlerts: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Mail size={20} />
                  <div>
                    <h4>Message Notifications</h4>
                    <p>Get notified about new messages</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificationSettings.messageNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, messageNotifications: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance</h3>
              <p className="section-description">Customize how Dolphin Cove looks</p>

              <div className="theme-options">
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={24} />
                  <span>Dark</span>
                </button>
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={24} />
                  <span>Light</span>
                </button>
                <button
                  className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor size={24} />
                  <span>System</span>
                </button>
              </div>

              <p className="theme-note">
                Note: Light theme coming soon! Currently only dark theme is available.
              </p>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security</h3>
              <p className="section-description">Keep your account secure</p>

              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>

              <button className="btn-primary save-btn">
                <Lock size={16} />
                Update Password
              </button>

              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <p>Once you delete your account, there is no going back.</p>
                <button className="btn-danger">Delete Account</button>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div className="settings-section">
              <h3>Billing & Subscription</h3>
              <p className="section-description">Manage your subscription and payment methods</p>

              <div className="subscription-card">
                <div className="subscription-info">
                  <h4>Free Plan</h4>
                  <p>You're currently on the free plan</p>
                </div>
                <button className="btn-primary">Upgrade to Pro</button>
              </div>

              <div className="billing-empty">
                <CreditCard size={48} />
                <h4>No payment methods</h4>
                <p>Add a payment method to upgrade your plan</p>
                <button className="btn-secondary">Add Payment Method</button>
              </div>
            </div>
          )}

          {/* Help & Support */}
          {activeTab === 'help' && (
            <div className="settings-section">
              <h3>Help & Support</h3>
              <p className="section-description">Get help with Dolphin Cove</p>

              <div className="help-links">
                <a href="#" className="help-link">
                  <HelpCircle size={20} />
                  <div>
                    <h4>Help Center</h4>
                    <p>Find answers to common questions</p>
                  </div>
                  <ChevronRight size={16} />
                </a>
                <a href="#" className="help-link">
                  <Mail size={20} />
                  <div>
                    <h4>Contact Support</h4>
                    <p>Get in touch with our team</p>
                  </div>
                  <ChevronRight size={16} />
                </a>
                <a href="#" className="help-link">
                  <Shield size={20} />
                  <div>
                    <h4>Privacy Policy</h4>
                    <p>Learn how we handle your data</p>
                  </div>
                  <ChevronRight size={16} />
                </a>
              </div>

              <div className="app-info">
                <p>Dolphin Cove v1.0.0</p>
                <p>© 2026 Dolphin Cove. All rights reserved.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
