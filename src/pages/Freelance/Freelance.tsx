import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { freelanceService, type FreelanceJob } from '../../services/freelanceService';
import './Freelance.css';

type TabType = 'browse' | 'my-posts' | 'my-applications' | 'hired';

const Freelance: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Video Editing',
    'Digital Marketing',
    'Data Entry',
    'Translation',
    'Other',
  ];

  useEffect(() => {
    fetchJobs();
  }, [activeTab, user?.id]);

  const fetchJobs = async () => {
    if (!user?.id && activeTab !== 'browse') {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let response;

      switch (activeTab) {
        case 'browse':
          response = await freelanceService.getJobs({
            search: searchQuery || undefined,
            category: categoryFilter || undefined,
            minBudget: budgetFilter ? parseInt(budgetFilter.split('-')[0]) : undefined,
            maxBudget: budgetFilter ? parseInt(budgetFilter.split('-')[1]) : undefined,
          });
          break;
        case 'my-posts':
          response = await freelanceService.getMyJobPosts(user!.id);
          break;
        case 'my-applications':
          response = await freelanceService.getMyApplications(user!.id);
          break;
        case 'hired':
          response = await freelanceService.getMyHiredJobs(user!.id);
          break;
      }

      setJobs(response?.data || []);
    } catch (error: any) {
      showError(error.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = (jobId: string) => {
    navigate(`/freelance/jobs/${jobId}`);
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusClass = (status: string) => {
    return status.replace('_', '-');
  };

  return (
    <div className="freelance-jobs-page">
      <div className="freelance-header">
        <h1>
          💼 Freelance Jobs
        </h1>
        {user && (
          <button className="create-job-btn" onClick={() => navigate('/freelance/create')}>
            ➕ Post a Job
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="freelance-tabs">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          🔍 Browse Jobs
        </button>
        {user && (
          <>
            <button
              className={`tab-btn ${activeTab === 'my-posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-posts')}
            >
              📋 My Job Posts
            </button>
            <button
              className={`tab-btn ${activeTab === 'my-applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-applications')}
            >
              📝 My Applications
            </button>
            <button
              className={`tab-btn ${activeTab === 'hired' ? 'active' : ''}`}
              onClick={() => setActiveTab('hired')}
            >
              ✅ Hired Jobs
            </button>
          </>
        )}
      </div>

      {/* Filters (only for browse tab) */}
      {activeTab === 'browse' && (
        <form className="filters-section" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setTimeout(fetchJobs, 0);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={budgetFilter}
            onChange={(e) => {
              setBudgetFilter(e.target.value);
              setTimeout(fetchJobs, 0);
            }}
          >
            <option value="">Any Budget</option>
            <option value="0-100">$0 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000-5000">$1,000 - $5,000</option>
            <option value="5000-999999">$5,000+</option>
          </select>
        </form>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No jobs found</h3>
          <p>
            {activeTab === 'browse'
              ? 'Try adjusting your filters or check back later.'
              : activeTab === 'my-posts'
              ? "You haven't posted any jobs yet."
              : activeTab === 'my-applications'
              ? "You haven't applied to any jobs yet."
              : "You haven't been hired for any jobs yet."}
          </p>
          {activeTab === 'my-posts' && (
            <button className="create-job-btn" onClick={() => navigate('/freelance/create')}>
              ➕ Post Your First Job
            </button>
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h3 className="job-title" onClick={() => navigate(`/freelance/jobs/${job.id}`)}>
                  {job.title}
                </h3>
                <span className={`job-status ${getStatusClass(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-meta">
                <div className="job-meta-item">
                  <span className="icon">💰</span>
                  <span className="job-budget">{formatBudget(job.budget)}</span>
                </div>
                <div className="job-meta-item">
                  <span className="icon">⏱️</span>
                  <span>{job.duration}</span>
                </div>
                <div className="job-meta-item">
                  <span className="icon">📁</span>
                  <span>{job.category}</span>
                </div>
                <div className="job-meta-item">
                  <span className="icon">📅</span>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
              </div>

              <div className="job-skills">
                {job.skills?.slice(0, 4).map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 4 && (
                  <span className="skill-tag">+{job.skills.length - 4}</span>
                )}
              </div>

              <div className="job-footer">
                <div className="job-client">
                  {job.clientAvatar ? (
                    <img src={job.clientAvatar} alt={job.clientName} className="client-avatar" />
                  ) : (
                    <div className="client-avatar">{job.clientName?.charAt(0)}</div>
                  )}
                  <span className="client-name">{job.clientName}</span>
                </div>

                {activeTab === 'browse' && job.status === 'open' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="applicants-count">
                      {job.applicants?.length || 0} applicants
                    </span>
                    <button
                      className="apply-btn"
                      onClick={() => handleApply(job.id)}
                      disabled={job.clientId === user?.id}
                    >
                      {job.clientId === user?.id ? 'Your Job' : 'View & Apply'}
                    </button>
                  </div>
                )}

                {activeTab === 'my-posts' && (
                  <button
                    className="apply-btn"
                    onClick={() => navigate(`/freelance/jobs/${job.id}/manage`)}
                  >
                    Manage ({job.applicants?.length || 0})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Freelance;
