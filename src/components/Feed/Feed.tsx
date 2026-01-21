import { usePosts } from '../../context/PostContext';
import { PostCard } from '../PostCard';
import { CreatePost } from '../CreatePost';
import './Feed.css';

export function Feed() {
  const { posts } = usePosts();

  return (
    <div className="feed">
      <CreatePost />
      
      <div className="feed-filters">
        <button className="filter-btn active">All Posts</button>
        <button className="filter-btn">Freelance Jobs</button>
        <button className="filter-btn">Code Snippets</button>
        <button className="filter-btn">Following</button>
      </div>

      <div className="posts-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
