import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { freelanceService, type CreateJobData } from '../../services/freelanceService';
import './CreateJob.css';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    category: '',
    skills: [],
    budget: 0,
    duration: '',
    attachments: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const durations = [
    'Less than 1 week',
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    '2-3 months',
    '3-6 months',
    'More than 6 months',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !formData.skills.includes(skill)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skill],
        }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (formData.skills.length === 0) {
      newErrors.skills = 'Add at least one required skill';
    }
    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }
    if (!formData.duration) {
      newErrors.duration = 'Please select a duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showError('Please log in to post a job');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await freelanceService.createJob(formData, user.id);
      showSuccess('Job posted successfully!');
      navigate('/freelance');
    } catch (error: any) {
      showError(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/freelance')}>
          ← Back to Jobs
        </button>
        <h1>Post a Freelance Job</h1>
        <p>Find the perfect freelancer for your project</p>
      </div>

      <form className="job-form" onSubmit={handleSubmit}>
        {/* Job Title */}
        <div className="form-group">
          <label>
            Job Title <span>*</span>
          </label>
          <input
            type="text"
            name="title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g., Build a React Native Mobile App"
            value={formData.title}
            onChange={handleInputChange}
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label>
            Description <span>*</span>
          </label>
          <textarea
            name="description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Describe the project in detail. Include requirements, deliverables, and any specific skills needed..."
            value={formData.description}
            onChange={handleInputChange}
          />
          <p className="helper-text">{formData.description.length}/50 minimum characters</p>
          {errors.description && <p className="form-error">{errors.description}</p>}
        </div>

        {/* Category & Duration */}
        <div className="form-row">
          <div className="form-group">
            <label>
              Category <span>*</span>
            </label>
            <select
              name="category"
              className={`form-select ${errors.category ? 'error' : ''}`}
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>

          <div className="form-group">
            <label>
              Duration <span>*</span>
            </label>
            <select
              name="duration"
              className={`form-select ${errors.duration ? 'error' : ''}`}
              value={formData.duration}
              onChange={handleInputChange}
            >
              <option value="">Select duration</option>
              {durations.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
            {errors.duration && <p className="form-error">{errors.duration}</p>}
          </div>
        </div>

        {/* Budget */}
        <div className="form-group">
          <label>
            Budget (USD) <span>*</span>
          </label>
          <input
            type="number"
            name="budget"
            className={`form-input ${errors.budget ? 'error' : ''}`}
            placeholder="Enter your budget"
            value={formData.budget || ''}
            onChange={handleInputChange}
            min="1"
          />
          <p className="helper-text">Set a fixed price for this project</p>
          {errors.budget && <p className="form-error">{errors.budget}</p>}
        </div>

        {/* Skills */}
        <div className="form-group">
          <label>
            Required Skills <span>*</span>
          </label>
          <div className="skills-input-container">
            {formData.skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)}>
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="skills-input"
              placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>
          <p className="helper-text">Add skills that freelancers should have</p>
          {errors.skills && <p className="form-error">{errors.skills}</p>}
        </div>

        {/* Attachments */}
        <div className="form-group">
          <label>Attachments (Optional)</label>
          <div className="attachments-area">
            <div className="icon">📎</div>
            <p>Drag and drop files here, or click to upload</p>
            <p className="supported">Supports: PDF, DOC, PNG, JPG (Max 10MB each)</p>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/freelance')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
