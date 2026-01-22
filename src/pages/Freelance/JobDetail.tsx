import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { freelanceService, type FreelanceJob } from '../../services/freelanceService';
import './JobDetail.css';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [job, setJob] = useState<FreelanceJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedBudget: '',
    proposedDuration: '',
  });

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await freelanceService.getJobById(jobId!);
      setJob(response.data);
    } catch (error: any) {
      showError('Failed to load job details');
      navigate('/freelance');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user?.id === job?.clientId;
  const hasApplied = job?.applicants?.some((a) => a.userId === user?.id);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showError('Please log in to apply');
      navigate('/login');
      return;
    }

    if (!applicationData.coverLetter.trim()) {
      showError('Please write a cover letter');
      return;
    }

    setApplying(true);
    try {
      await freelanceService.applyToJob(jobId!, {
        userId: user.id,
        userName: user.displayName || user.username || 'User',
        userAvatar: user.avatar,
        coverLetter: applicationData.coverLetter,
        proposedBudget: applicationData.proposedBudget
          ? parseFloat(applicationData.proposedBudget)
          : undefined,
        proposedDuration: applicationData.proposedDuration || undefined,
      });

      showSuccess('Application submitted successfully!');
      fetchJob(); // Refresh to show applied status
    } catch (error: any) {
      showError(error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-page">
        <div className="empty-state">
          <h3>Job not found</h3>
          <button onClick={() => navigate('/freelance')}>Back to Jobs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-header">
        <button className="back-btn" onClick={() => navigate('/freelance')}>
          ← Back to Jobs
        </button>
      </div>

      {/* Job Details Card */}
      <div className="job-detail-card">
        <div className="job-title-section">
          <h1>{job.title}</h1>
          <span className={`job-status-badge ${job.status}`}>
            {job.status.replace('_', ' ')}
          </span>
        </div>

        <div className="job-client-info">
          {job.clientAvatar ? (
            <img src={job.clientAvatar} alt={job.clientName} className="client-avatar" />
          ) : (
            <div className="client-avatar">{job.clientName?.charAt(0)}</div>
          )}
          <div className="client-details">
            <h3>{job.clientName}</h3>
            <p>Posted on {formatDate(job.createdAt)}</p>
          </div>
        </div>

        <div className="job-meta-grid">
          <div className="meta-item">
            <div className="label">💰 Budget</div>
            <div className="value budget">{formatBudget(job.budget)}</div>
          </div>
          <div className="meta-item">
            <div className="label">⏱️ Duration</div>
            <div className="value">{job.duration}</div>
          </div>
          <div className="meta-item">
            <div className="label">📁 Category</div>
            <div className="value">{job.category}</div>
          </div>
          <div className="meta-item">
            <div className="label">👥 Applicants</div>
            <div className="value">{job.applicants?.length || 0}</div>
          </div>
        </div>

        <div className="job-description-section">
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>

        <div className="job-skills-section">
          <h2>Required Skills</h2>
          <div className="skills-list">
            {job.skills?.map((skill) => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.attachments && job.attachments.length > 0 && (
          <div className="job-attachments-section">
            <h2>Attachments</h2>
            {job.attachments.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                📎 Attachment {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Apply Section */}
      <div className="apply-section">
        {isOwner ? (
          <div className="own-job-banner">
            <h3>📋 This is your job posting</h3>
            <p>You can manage applicants and hire freelancers from here.</p>
            <button className="manage-btn" onClick={() => navigate(`/freelance/jobs/${jobId}/manage`)}>
              Manage Applicants ({job.applicants?.length || 0})
            </button>
          </div>
        ) : hasApplied ? (
          <div className="already-applied-banner">
            <h3>✅ You've already applied</h3>
            <p>Your application has been submitted. The client will review it soon.</p>
          </div>
        ) : job.status !== 'open' ? (
          <div className="already-applied-banner">
            <h3>🔒 This job is no longer accepting applications</h3>
            <p>The position has been filled or closed.</p>
          </div>
        ) : (
          <>
            <h2>Apply for this Job</h2>
            <p>Tell the client why you're the perfect fit for this project.</p>

            <form className="apply-form" onSubmit={handleApply}>
              <div className="form-group">
                <label>
                  Cover Letter <span>*</span>
                </label>
                <textarea
                  placeholder="Introduce yourself, explain your experience with similar projects, and why you're interested in this job..."
                  value={applicationData.coverLetter}
                  onChange={(e) =>
                    setApplicationData((prev) => ({ ...prev, coverLetter: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Proposed Budget (Optional)</label>
                  <input
                    type="number"
                    placeholder="Your rate for this project"
                    value={applicationData.proposedBudget}
                    onChange={(e) =>
                      setApplicationData((prev) => ({ ...prev, proposedBudget: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Duration (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 weeks"
                    value={applicationData.proposedDuration}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        proposedDuration: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <button type="submit" className="apply-btn-full" disabled={applying}>
                {applying ? 'Submitting...' : '🚀 Submit Application'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
