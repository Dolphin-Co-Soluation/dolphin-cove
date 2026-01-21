import { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Clock,
  DollarSign,
  Code,
  Send
} from 'lucide-react';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import type { Post as PostType } from '../../types';
import './PostCard.css';

interface PostCardProps {
  post: PostType;
}

export function PostCard({ post }: PostCardProps) {
  const { likePost, addComment } = usePosts();
  const { user, isAuthenticated } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const hasLiked = user ? post.likes.includes(user.id) : false;

  const handleLike = () => {
    if (user) {
      likePost(post.id, user.id);
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      addComment(post.id, {
        author: user,
        content: newComment.trim(),
      });
      setNewComment('');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <article className={`post-card ${post.isFreelancePost ? 'freelance-post' : ''}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="avatar">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.displayName} />
            ) : (
              <span>{post.author.displayName.charAt(0)}</span>
            )}
          </div>
          <div className="author-info">
            <div className="author-name">
              <h4>{post.author.displayName}</h4>
              {post.author.isFreelancer && (
                <span className="freelancer-tag">
                  <Code size={10} />
                </span>
              )}
            </div>
            <p>@{post.author.username} • {formatTime(post.createdAt)}</p>
          </div>
        </div>
        <button className="more-btn">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Freelance Badge */}
      {post.isFreelancePost && post.freelanceDetails && (
        <div className="freelance-badge-container">
          <span className="freelance-label">🌊 Freelance Opportunity</span>
        </div>
      )}

      {/* Post Content */}
      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {/* Freelance Details */}
      {post.isFreelancePost && post.freelanceDetails && (
        <div className="freelance-details">
          <h3>{post.freelanceDetails.title}</h3>
          <div className="freelance-meta">
            <span className="meta-item">
              <DollarSign size={14} />
              {post.freelanceDetails.budget}
            </span>
            <span className="meta-item">
              <Clock size={14} />
              {post.freelanceDetails.deadline}
            </span>
            <span className={`project-type ${post.freelanceDetails.projectType}`}>
              {post.freelanceDetails.projectType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
            </span>
          </div>
          <div className="freelance-skills">
            {post.freelanceDetails.skills.map((skill) => (
              <span key={skill} className="skill-chip">{skill}</span>
            ))}
          </div>
          <button className="apply-btn">Apply Now</button>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post content" />
        </div>
      )}

      {/* Post Stats */}
      <div className="post-stats">
        <span>{post.likes.length} waves</span>
        <span>{post.comments.length} comments</span>
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`action-btn ${hasLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={!isAuthenticated}
        >
          <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
          <span>Wave</span>
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="action-btn">
          <Share2 size={20} />
          <span>Share</span>
        </button>
        <button 
          className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          <span>Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Comment Input */}
          {isAuthenticated && (
            <form className="comment-input" onSubmit={handleComment}>
              <div className="avatar-tiny">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" disabled={!newComment.trim()}>
                <Send size={16} />
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="avatar-tiny">
                  {comment.author.displayName.charAt(0)}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <strong>{comment.author.displayName}</strong>
                    <span>{formatTime(comment.createdAt)}</span>
                  </div>
                  <p>{comment.content}</p>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <Heart size={14} />
                      <span>{comment.likes.length}</span>
                    </button>
                    <button className="comment-action">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
