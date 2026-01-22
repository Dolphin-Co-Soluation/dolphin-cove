import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit3, 
  Briefcase,
  Code,
  Star,
  Users,
  Grid,
  FileText,
  Settings,
  Camera,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostContext';
import { PostCard } from '../../components/PostCard/PostCard';
import './Profile.css';

type TabType = 'posts' | 'projects' | 'about';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { posts } = usePosts();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isEditing, setIsEditing] = useState(false);

  // Check if viewing own profile or someone else's
  const isOwnProfile = !username || username === user?.username;
  const profileUser = isOwnProfile ? user : null; // TODO: Fetch other user from backend

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>Please log in to view profiles</h2>
          <Link to="/login" className="btn-primary">Log In</Link>
        </div>
      </div>
    );
  }

  const userPosts = posts.filter(post => post.author.id === user?.id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <div className="profile-page">
      {/* Cover & Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          {profileUser?.coverImage ? (
            <img src={profileUser.coverImage} alt="Cover" />
          ) : (
            <div className="default-cover">
              <div className="cover-pattern"></div>
            </div>
          )}
          {isOwnProfile && (
            <button className="edit-cover-btn">
              <Camera size={16} />
              Edit Cover
            </button>
          )}
        </div>

        <div className="profile-main-info">
          <div className="avatar-section">
            <div className="avatar-large">
              {profileUser?.avatar ? (
                <img src={profileUser.avatar} alt={profileUser?.displayName} />
              ) : (
                <span>{profileUser?.displayName?.charAt(0) || 'U'}</span>
              )}
            </div>
            {isOwnProfile && (
              <button className="edit-avatar-btn">
                <Camera size={14} />
              </button>
            )}
          </div>

          <div className="profile-details">
            <div className="name-row">
              <h1>{profileUser?.displayName || 'User'}</h1>
              {profileUser?.isFreelancer && (
                <span className="freelancer-badge">
                  <Code size={14} />
                  Freelancer
                </span>
              )}
            </div>
            <p className="username">@{profileUser?.username || 'username'}</p>
            
            {profileUser?.bio ? (
              <p className="bio">{profileUser.bio}</p>
            ) : isOwnProfile ? (
              <p className="bio empty">Add a bio to tell others about yourself</p>
            ) : null}

            <div className="profile-meta">
              {profileUser?.location && (
                <span><MapPin size={14} /> {profileUser.location}</span>
              )}
              {profileUser?.portfolio && (
                <a href={profileUser.portfolio} target="_blank" rel="noopener noreferrer">
                  <LinkIcon size={14} /> Portfolio
                </a>
              )}
              <span>
                <Calendar size={14} /> Joined {profileUser?.joinedAt ? formatDate(profileUser.joinedAt) : 'Recently'}
              </span>
            </div>

            {profileUser?.hourlyRate && (
              <div className="hourly-rate">
                <Briefcase size={14} />
                <span>${profileUser.hourlyRate}/hour</span>
              </div>
            )}
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <button className="btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button className="btn-primary">Connect</button>
                <button className="btn-secondary">Message</button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <strong>{profileUser?.connections?.length || 0}</strong>
            <span>Connections</span>
          </div>
          <div className="stat-item">
            <strong>{profileUser?.followers?.length || 0}</strong>
            <span>Followers</span>
          </div>
          <div className="stat-item">
            <strong>{profileUser?.projects?.length || 0}</strong>
            <span>Projects</span>
          </div>
          <div className="stat-item">
            <strong>{profileUser?.rating || '-'}</strong>
            <span>Rating</span>
            {profileUser?.reviewCount && (
              <small>({profileUser.reviewCount} reviews)</small>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <FileText size={18} />
            Posts
          </button>
          <button 
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Grid size={18} />
            Projects
          </button>
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Users size={18} />
            About
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'posts' && (
            <div className="posts-tab">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="empty-state">
                  <FileText size={48} />
                  <h3>No posts yet</h3>
                  {isOwnProfile && (
                    <p>Share your first post with the community!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="projects-tab">
              <div className="empty-state">
                <Grid size={48} />
                <h3>No projects yet</h3>
                {isOwnProfile && (
                  <>
                    <p>Showcase your work to potential clients</p>
                    <button className="btn-primary">
                      <Plus size={16} />
                      Add Project
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-tab">
              <div className="about-section">
                <h3>Skills</h3>
                {profileUser?.skills && profileUser.skills.length > 0 ? (
                  <div className="skills-list">
                    {profileUser.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">
                    {isOwnProfile ? 'Add your skills to help clients find you' : 'No skills added yet'}
                  </p>
                )}
                {isOwnProfile && (
                  <button className="add-btn">
                    <Plus size={14} /> Add Skills
                  </button>
                )}
              </div>

              <div className="about-section">
                <h3>Experience</h3>
                <div className="empty-state-small">
                  <Briefcase size={24} />
                  <p>{isOwnProfile ? 'Add your work experience' : 'No experience added'}</p>
                  {isOwnProfile && (
                    <button className="add-btn">
                      <Plus size={14} /> Add Experience
                    </button>
                  )}
                </div>
              </div>

              <div className="about-section">
                <h3>Reviews</h3>
                <div className="empty-state-small">
                  <Star size={24} />
                  <p>No reviews yet</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal - Placeholder */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <p className="modal-note">Profile editing will be available when backend is connected</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Close</button>
              <Link to="/settings" className="btn-primary">
                <Settings size={16} />
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
