import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code, Briefcase, Users, Zap, Globe, Shield, Waves, ChevronRight } from 'lucide-react';
import logo from '../../assets/Dolphin-cove.png';
import './LandingPage.css';

export function LandingPage() {
  const [stats, setStats] = useState({ developers: 0, projects: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            developers: data.data?.developers || 0,
            projects: data.data?.projects || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to placeholder values
        setStats({ developers: 0, projects: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="ocean-gradient"></div>
          <div className="wave-animation wave1"></div>
          <div className="wave-animation wave2"></div>
          <div className="floating-code code1">{'<Code />'}</div>
          <div className="floating-code code2">{'{ }'}</div>
          <div className="floating-code code3">{'// 🐬'}</div>
          <div className="bubbles-container">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="bubble" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 6}s`,
                width: `${10 + Math.random() * 20}px`,
                height: `${10 + Math.random() * 20}px`,
              }}></div>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Waves size={16} />
            <span>The Future of Freelance</span>
          </div>
          
          <h1>
            Dive Into the <span className="gradient-text">Ocean</span> of
            <br />
            <span className="gradient-text">Tech Opportunities</span>
          </h1>
          
          <p className="hero-description">
            Connect with top developers, find freelance projects, share your code journey,
            and ride the wave to your next big opportunity. Join the pod today! 🐬
          </p>
          
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              Start Your Journey
              <ChevronRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <strong>{isLoading ? '...' : stats.developers.toLocaleString()}</strong>
              <span>Developers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <strong>{isLoading ? '...' : stats.projects.toLocaleString()}</strong>
              <span>Projects</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dolphin-container">
            <img src={logo} alt="Dolphin Cove" className="hero-dolphin" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Swim With Us?</h2>
          <p>Everything you need to thrive in the freelance ocean</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Code size={28} />
            </div>
            <h3>Code & Connect</h3>
            <p>Share your projects, code snippets, and tech insights with a community that speaks your language.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Briefcase size={28} />
            </div>
            <h3>Freelance Hub</h3>
            <p>Post and find freelance opportunities. From quick gigs to long-term projects, we've got you covered.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users size={28} />
            </div>
            <h3>Build Your Pod</h3>
            <p>Network with like-minded developers, form teams, and collaborate on exciting ventures.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={28} />
            </div>
            <h3>Real-Time Updates</h3>
            <p>Stay current with instant notifications, trending topics, and the latest in tech.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Globe size={28} />
            </div>
            <h3>Remote First</h3>
            <p>Work from anywhere in the world. Our platform is built for the global developer community.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={28} />
            </div>
            <h3>Secure & Safe</h3>
            <p>Your data and transactions are protected with industry-leading security measures.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make a Splash?</h2>
          <p>Join thousands of developers who've found their flow in Dolphin Cove</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Join the Pod Today
            <Waves size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src={logo} alt="Dolphin Cove" className="footer-logo" />
            <span>Dolphin Cove</span>
          </div>
          <p>© 2026 Dolphin Cove. Ride the wave of freelance 🌊</p>
        </div>
      </footer>
    </div>
  );
}
