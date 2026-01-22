import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { freelanceService, type FreelanceJob, type JobApplication } from '../../services/freelanceService';
import './ManageApplicants.css';

const ManageApplicants: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [job, setJob] = useState<FreelanceJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await freelanceService.getJobById(jobId!);
      setJob(response.data);

      // Check if user is the owner
      if (response.data.clientId !== user?.id) {
        showError("You don't have permission to manage this job");
        navigate('/freelance');
      }
    } catch (error: any) {
      showError('Failed to load job details');
      navigate('/freelance');
    } finally {
      setLoading(false);
    }
  };

  const handleHireClick = (applicant: JobApplication) => {
    setSelectedApplicant(applicant);
    setShowConfirmModal(true);
  };

  const handleConfirmHire = async () => {
    if (!selectedApplicant || !user) return;

    setHiring(selectedApplicant.userId);
    try {
      await freelanceService.hireFreelancer(jobId!, selectedApplicant.userId, user.id);
      showSuccess(`Successfully hired ${selectedApplicant.userName}!`);
      fetchJob(); // Refresh to show updated status
    } catch (error: any) {
      showError(error.message || 'Failed to hire freelancer');
    } finally {
      setHiring(null);
      setShowConfirmModal(false);
      setSelectedApplicant(null);
    }
  };

  const handleCloseJob = async () => {
    if (!user) return;

    try {
      await freelanceService.updateJob(jobId!, { status: 'cancelled' } as any);
      showSuccess('Job closed successfully');
      navigate('/freelance');
    } catch (error: any) {
      showError(error.message || 'Failed to close job');
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="manage-applicants-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="manage-applicants-page">
      <div className="manage-header">
        <button className="back-btn" onClick={() => navigate('/freelance')}>
          ← Back to Jobs
        </button>
        <h1>Manage Applicants</h1>
        <p>Review applications and hire the best freelancer for your project</p>
      </div>

      {/* Job Summary */}
      <div className="job-summary-card">
        <div className="job-summary-info">
          <h2>{job.title}</h2>
          <div className="meta">
            <span>💰 {formatBudget(job.budget)}</span>
            <span>⏱️ {job.duration}</span>
            <span>📁 {job.category}</span>
            <span className={`status ${job.status}`}>
              {job.status === 'open' ? '🟢 Open' : job.status === 'in_progress' ? '🟡 In Progress' : '✅ Completed'}
            </span>
          </div>
        </div>
        <div className="job-actions">
          <button className="edit-job-btn" onClick={() => navigate(`/freelance/jobs/${jobId}`)}>
            View Job
          </button>
          {job.status === 'open' && (
            <button className="close-job-btn" onClick={handleCloseJob}>
              Close Job
            </button>
          )}
        </div>
      </div>

      {/* Applicants */}
      <div className="applicants-section">
        <h2>
          Applicants <span className="applicants-count">{job.applicants?.length || 0}</span>
        </h2>

        {!job.applicants || job.applicants.length === 0 ? (
          <div className="no-applicants">
            <div className="icon">📭</div>
            <h3>No applications yet</h3>
            <p>Share your job posting to attract freelancers</p>
          </div>
        ) : (
          <div className="applicants-list">
            {job.applicants.map((applicant) => (
              <div
                key={applicant.userId}
                className={`applicant-card ${job.freelancerId === applicant.userId ? 'hired' : ''}`}
              >
                <div className="applicant-header">
                  <div className="applicant-info">
                    {applicant.userAvatar ? (
                      <img
                        src={applicant.userAvatar}
                        alt={applicant.userName}
                        className="applicant-avatar"
                      />
                    ) : (
                      <div className="applicant-avatar">{applicant.userName?.charAt(0)}</div>
                    )}
                    <div className="applicant-details">
                      <h3>{applicant.userName}</h3>
                      <p className="applied-date">Applied {formatDate(applicant.appliedAt)}</p>
                    </div>
                  </div>
                  {job.freelancerId === applicant.userId && (
                    <div className="hired-badge">✅ Hired</div>
                  )}
                </div>

                <div className="applicant-proposal">
                  {(applicant.proposedBudget || applicant.proposedDuration) && (
                    <div className="proposal-stats">
                      {applicant.proposedBudget && (
                        <div className="proposal-stat">
                          <span className="label">Proposed Budget</span>
                          <span className="value budget">{formatBudget(applicant.proposedBudget)}</span>
                        </div>
                      )}
                      {applicant.proposedDuration && (
                        <div className="proposal-stat">
                          <span className="label">Estimated Duration</span>
                          <span className="value">{applicant.proposedDuration}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="cover-letter">
                    <h4>Cover Letter</h4>
                    <p>{applicant.coverLetter}</p>
                  </div>
                </div>

                <div className="applicant-actions">
                  <button
                    className="view-profile-btn"
                    onClick={() => navigate(`/profile/${applicant.userId}`)}
                  >
                    View Profile
                  </button>
                  {job.status === 'open' && (
                    <button
                      className="hire-btn"
                      onClick={() => handleHireClick(applicant)}
                      disabled={hiring === applicant.userId}
                    >
                      {hiring === applicant.userId ? 'Hiring...' : '🤝 Hire This Freelancer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedApplicant && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Hire</h2>
            <p>
              Are you sure you want to hire <strong>{selectedApplicant.userName}</strong> for this
              job? This will close the job for other applicants.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="modal-confirm-btn" onClick={handleConfirmHire}>
                Yes, Hire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplicants;
