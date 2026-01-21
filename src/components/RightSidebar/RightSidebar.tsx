import { Briefcase, MapPin, ExternalLink, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './RightSidebar.css';

export function RightSidebar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <aside className="right-sidebar">
      {/* Featured Jobs */}
      <div className="sidebar-card">
        <div className="card-header">
          <Briefcase size={18} />
          <h3>Hot Opportunities</h3>
          <span className="badge">New</span>
        </div>
        
        <div className="job-list">
          <div className="job-item">
            <div className="job-logo">🐬</div>
            <div className="job-info">
              <h4>Full Stack Developer</h4>
              <p className="company">OceanTech Inc.</p>
              <div className="job-meta">
                <span><MapPin size={12} /> Remote</span>
                <span>$80-120k</span>
              </div>
            </div>
          </div>
          
          <div className="job-item">
            <div className="job-logo">🌊</div>
            <div className="job-info">
              <h4>React Native Expert</h4>
              <p className="company">WaveApp Studio</p>
              <div className="job-meta">
                <span><MapPin size={12} /> Hybrid</span>
                <span>$70-90k</span>
              </div>
            </div>
          </div>
          
          <div className="job-item">
            <div className="job-logo">🐚</div>
            <div className="job-info">
              <h4>DevOps Engineer</h4>
              <p className="company">ShellCloud Systems</p>
              <div className="job-meta">
                <span><MapPin size={12} /> Remote</span>
                <span>$100-140k</span>
              </div>
            </div>
          </div>
        </div>
        
        <a href="/jobs" className="see-all-link">
          View all jobs
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Who to Follow */}
      <div className="sidebar-card">
        <div className="card-header">
          <Zap size={18} />
          <h3>Developers to Follow</h3>
        </div>
        
        <div className="follow-list">
          <div className="follow-item">
            <div className="follow-avatar">S</div>
            <div className="follow-info">
              <h4>Seafoam Dev</h4>
              <p>AI/ML Engineer</p>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
          
          <div className="follow-item">
            <div className="follow-avatar">T</div>
            <div className="follow-info">
              <h4>Tidal Coder</h4>
              <p>Blockchain Dev</p>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
          
          <div className="follow-item">
            <div className="follow-avatar">A</div>
            <div className="follow-info">
              <h4>Aqua Scripts</h4>
              <p>Frontend Wizard</p>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="sidebar-card">
        <div className="card-header">
          <TrendingUp size={18} />
          <h3>Trending in Tech</h3>
        </div>
        
        <div className="trending-list">
          <div className="trending-item">
            <span className="trend-rank">1</span>
            <div className="trend-info">
              <h4>#ReactServer</h4>
              <p>2.4k posts today</p>
            </div>
          </div>
          
          <div className="trending-item">
            <span className="trend-rank">2</span>
            <div className="trend-info">
              <h4>#AIAssistants</h4>
              <p>1.8k posts today</p>
            </div>
          </div>
          
          <div className="trending-item">
            <span className="trend-rank">3</span>
            <div className="trend-info">
              <h4>#RustLang</h4>
              <p>1.2k posts today</p>
            </div>
          </div>
          
          <div className="trending-item">
            <span className="trend-rank">4</span>
            <div className="trend-info">
              <h4>#RemoteWork</h4>
              <p>980 posts today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/help">Help</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
        <p className="copyright">© 2026 Dolphin Cove</p>
      </div>
    </aside>
  );
}
