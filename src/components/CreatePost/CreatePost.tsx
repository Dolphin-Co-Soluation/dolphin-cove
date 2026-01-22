import { useState } from 'react';
import { 
  Image, 
  Briefcase, 
  Code, 
  Smile,
  X,
  DollarSign,
  Clock
} from 'lucide-react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './CreatePost.css';

export function CreatePost() {
  const { addPost } = usePosts();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [content, setContent] = useState('');
  const [isFreelance, setIsFreelance] = useState(false);
  const [showFreelanceForm, setShowFreelanceForm] = useState(false);
  const [freelanceDetails, setFreelanceDetails] = useState({
    title: '',
    budget: '',
    deadline: '',
    skills: '',
    projectType: 'fixed' as 'fixed' | 'hourly',
  });

  if (!isAuthenticated || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      showError('Please write something before posting');
      return;
    }

    if (isFreelance && !freelanceDetails.title.trim()) {
      showError('Please add a title for your freelance post');
      return;
    }

    addPost({
      author: user,
      content: content.trim(),
      isFreelancePost: isFreelance,
      freelanceDetails: isFreelance ? {
        title: freelanceDetails.title,
        budget: freelanceDetails.budget,
        deadline: freelanceDetails.deadline,
        skills: freelanceDetails.skills.split(',').map(s => s.trim()).filter(Boolean),
        projectType: freelanceDetails.projectType,
      } : undefined,
    });

    // Reset form
    setContent('');
    setIsFreelance(false);
    setShowFreelanceForm(false);
    setFreelanceDetails({
      title: '',
      budget: '',
      deadline: '',
      skills: '',
      projectType: 'fixed',
    });

    showSuccess(isFreelance ? 'Freelance post created!' : 'Post shared successfully!');
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <div className="create-post-header">
          <div className="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.displayName} />
            ) : (
              <span>{user.displayName.charAt(0)}</span>
            )}
          </div>
          <textarea
            placeholder={isFreelance 
              ? "Describe your freelance project or opportunity..." 
              : "Share your thoughts, code snippets, or opportunities..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
        </div>

        {/* Freelance Toggle */}
        {showFreelanceForm && (
          <div className="freelance-form">
            <div className="freelance-form-header">
              <h4>🌊 Freelance Opportunity Details</h4>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => {
                  setShowFreelanceForm(false);
                  setIsFreelance(false);
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g., Senior React Developer"
                  value={freelanceDetails.title}
                  onChange={(e) => setFreelanceDetails(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <DollarSign size={14} />
                    Budget
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $5,000 or $50/hr"
                    value={freelanceDetails.budget}
                    onChange={(e) => setFreelanceDetails(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <Clock size={14} />
                    Timeline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2 weeks"
                    value={freelanceDetails.deadline}
                    onChange={(e) => setFreelanceDetails(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Code size={14} />
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, TypeScript, Node.js"
                  value={freelanceDetails.skills}
                  onChange={(e) => setFreelanceDetails(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Project Type</label>
                <div className="project-type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${freelanceDetails.projectType === 'fixed' ? 'active' : ''}`}
                    onClick={() => setFreelanceDetails(prev => ({ ...prev, projectType: 'fixed' }))}
                  >
                    Fixed Price
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${freelanceDetails.projectType === 'hourly' ? 'active' : ''}`}
                    onClick={() => setFreelanceDetails(prev => ({ ...prev, projectType: 'hourly' }))}
                  >
                    Hourly Rate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="create-post-footer">
          <div className="post-options">
            <button type="button" className="option-btn">
              <Image size={20} />
              <span>Image</span>
            </button>
            <button 
              type="button" 
              className={`option-btn ${isFreelance ? 'active' : ''}`}
              onClick={() => {
                setIsFreelance(!isFreelance);
                setShowFreelanceForm(!showFreelanceForm);
              }}
            >
              <Briefcase size={20} />
              <span>Freelance</span>
            </button>
            <button type="button" className="option-btn">
              <Code size={20} />
              <span>Code</span>
            </button>
            <button type="button" className="option-btn">
              <Smile size={20} />
              <span>Emoji</span>
            </button>
          </div>
          
          <button 
            type="submit" 
            className="post-btn"
            disabled={!content.trim()}
          >
            🌊 Post
          </button>
        </div>
      </form>
    </div>
  );
}
