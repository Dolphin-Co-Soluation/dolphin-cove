import { useState } from 'react';
import { 
  Search, 
  Briefcase,
  SlidersHorizontal,
  X,
  Inbox
} from 'lucide-react';
import './Jobs.css';

type JobType = 'all' | 'fulltime' | 'parttime' | 'contract' | 'freelance';
type LocationType = 'all' | 'remote' | 'hybrid' | 'onsite';

export function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobType, setJobType] = useState<JobType>('all');
  const [locationType, setLocationType] = useState<LocationType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // TODO: Replace with real data from backend
  const jobs: unknown[] = [];
  
  const popularSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 
    'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL'
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setJobType('all');
    setLocationType('all');
    setSalaryRange({ min: '', max: '' });
    setSelectedSkills([]);
    setSearchQuery('');
  };

  const hasActiveFilters = jobType !== 'all' || locationType !== 'all' || 
    salaryRange.min || salaryRange.max || selectedSkills.length > 0;

  return (
    <div className="jobs-page">
      {/* Header */}
      <div className="jobs-header">
        <div className="header-content">
          <h1>🐬 Find Your Next Opportunity</h1>
          <p>Discover freelance gigs and full-time positions in tech</p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search jobs by title, company, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} />
            Filters
            {hasActiveFilters && <span className="filter-badge" />}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Job Type</label>
              <div className="filter-options">
                {(['all', 'fulltime', 'parttime', 'contract', 'freelance'] as JobType[]).map(type => (
                  <button
                    key={type}
                    className={`filter-chip ${jobType === type ? 'active' : ''}`}
                    onClick={() => setJobType(type)}
                  >
                    {type === 'all' ? 'All Types' : 
                     type === 'fulltime' ? 'Full-time' :
                     type === 'parttime' ? 'Part-time' :
                     type === 'contract' ? 'Contract' : 'Freelance'}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <div className="filter-options">
                {(['all', 'remote', 'hybrid', 'onsite'] as LocationType[]).map(loc => (
                  <button
                    key={loc}
                    className={`filter-chip ${locationType === loc ? 'active' : ''}`}
                    onClick={() => setLocationType(loc)}
                  >
                    {loc === 'all' ? 'All Locations' :
                     loc === 'remote' ? '🌍 Remote' :
                     loc === 'hybrid' ? '🏢 Hybrid' : '📍 On-site'}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Salary Range ($/year)</label>
              <div className="salary-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={salaryRange.min}
                  onChange={(e) => setSalaryRange({ ...salaryRange, min: e.target.value })}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={salaryRange.max}
                  onChange={(e) => setSalaryRange({ ...salaryRange, max: e.target.value })}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Skills</label>
              <div className="skills-filter">
                {popularSkills.map(skill => (
                  <button
                    key={skill}
                    className={`skill-chip ${selectedSkills.includes(skill) ? 'active' : ''}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button className="clear-filters" onClick={clearFilters}>
                <X size={16} />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Jobs Content */}
      <div className="jobs-content">
        {/* Results Summary */}
        <div className="results-summary">
          <span>{jobs.length} jobs found</span>
          <div className="sort-dropdown">
            <span>Sort by:</span>
            <select>
              <option value="recent">Most Recent</option>
              <option value="salary-high">Highest Salary</option>
              <option value="salary-low">Lowest Salary</option>
              <option value="relevant">Most Relevant</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="jobs-list">
          {jobs.length > 0 ? (
            // TODO: Map over real jobs when backend is ready
            <></>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Inbox size={64} />
              </div>
              <h2>No Jobs Available Yet</h2>
              <p>We're still building our job board. Check back soon for exciting opportunities!</p>
              <div className="empty-actions">
                <button className="btn-secondary">
                  <Bell size={16} />
                  Get Job Alerts
                </button>
                <button className="btn-primary">
                  <Briefcase size={16} />
                  Post a Job
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Card Template (for future use) */}
        {/* 
        <div className="job-card">
          <div className="job-card-header">
            <div className="company-logo">
              <img src="" alt="Company" />
            </div>
            <div className="job-main-info">
              <h3>Job Title</h3>
              <p className="company-name">Company Name</p>
            </div>
            <button className="save-job">
              <BookmarkPlus size={20} />
            </button>
          </div>

          <div className="job-details">
            <span><MapPin size={14} /> Remote</span>
            <span><Briefcase size={14} /> Full-time</span>
            <span><DollarSign size={14} /> $80k - $120k</span>
            <span><Clock size={14} /> Posted 2 days ago</span>
          </div>

          <p className="job-description">
            Brief job description here...
          </p>

          <div className="job-skills">
            <span>React</span>
            <span>TypeScript</span>
            <span>Node.js</span>
          </div>

          <div className="job-actions">
            <button className="btn-primary">Apply Now</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
        */}
      </div>

      {/* Sidebar - Post a Job CTA */}
      <aside className="jobs-sidebar">
        <div className="cta-card">
          <h3>🚀 Looking to Hire?</h3>
          <p>Post your job and reach thousands of talented developers</p>
          <button className="btn-primary">
            <Briefcase size={16} />
            Post a Job
          </button>
        </div>

        <div className="tips-card">
          <h4>💡 Job Search Tips</h4>
          <ul>
            <li>Keep your profile updated with latest skills</li>
            <li>Set up job alerts for your preferred roles</li>
            <li>Include a portfolio link in your profile</li>
            <li>Network with other developers</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

// Bell icon component for the empty state
function Bell({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
