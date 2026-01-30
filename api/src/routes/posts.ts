import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/posts - Get posts feed
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50);
    const authorId = req.query.authorId as string;
    const viewerId = req.query.viewerId as string;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' });

    if (authorId) {
      query = query.eq('author_id', authorId);
      // If viewer is not the author, only show public posts
      if (viewerId !== authorId) {
        query = query.eq('visibility', 'public');
      }
    } else {
      query = query.eq('visibility', 'public');
    }

    // Get total count and paginated posts
    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    // Fetch author details
    const authorIds = [...new Set(posts?.map(p => p.author_id) || [])];
    let authorsMap: Record<string, any> = {};

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, username, display_name, avatar, is_verified')
        .in('id', authorIds);

      if (authors) {
        authors.forEach(author => {
          authorsMap[author.id] = author;
        });
      }
    }

    // Combine posts with authors
    const postsWithAuthors = posts?.map(post => {
      const author = authorsMap[post.author_id];
      return {
        id: post.id,
        content: post.content,
        media: post.media,
        visibility: post.visibility,
        authorId: post.author_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.display_name,
          avatar: author.avatar,
          isVerified: author.is_verified,
        } : null,
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        isLiked: viewerId ? post.likes?.includes(viewerId) : false,
      };
    }) || [];

    res.json({
      success: true,
      data: postsWithAuthors,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// ============================================================================
// GET /api/posts/:id - Get single post
// ============================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const viewerId = req.query.viewerId as string;

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Get author details
    const { data: author } = await supabase
      .from('users')
      .select('id, username, display_name, avatar, is_verified')
      .eq('id', post.author_id)
      .single();

    const postWithAuthor = {
      id: post.id,
      content: post.content,
      media: post.media,
      visibility: post.visibility,
      authorId: post.author_id,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: author ? {
        id: author.id,
        username: author.username,
        displayName: author.display_name,
        avatar: author.avatar,
        isVerified: author.is_verified,
      } : null,
      likes: post.likes || [],
      likesCount: post.likes?.length || 0,
      comments: post.comments || [],
      commentsCount: post.comments?.length || 0,
      isLiked: viewerId ? post.likes?.includes(viewerId) : false,
    };

    res.json({ success: true, data: postWithAuthor });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
});

// ============================================================================
// POST /api/posts - Create new post
// ============================================================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const { authorId, content, media, visibility } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'authorId and content are required' 
      });
    }

    const postId = uuidv4();
    const now = new Date().toISOString();

    const newPost = {
      id: postId,
      author_id: authorId,
      content,
      media: media || [],
      visibility: visibility || 'public',
      likes: [],
      comments: [],
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(newPost)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get author details
    const { data: author } = await supabase
      .from('users')
      .select('id, username, display_name, avatar, is_verified')
      .eq('id', authorId)
      .single();

    const postWithAuthor = {
      ...data,
      authorId: data.author_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      author: author ? {
        id: author.id,
        username: author.username,
        displayName: author.display_name,
        avatar: author.avatar,
        isVerified: author.is_verified,
      } : null,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
    };

    res.status(201).json({ success: true, data: postWithAuthor });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// ============================================================================
// PUT /api/posts/:id - Update post
// ============================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { content, media, visibility } = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (content !== undefined) updateData.content = content;
    if (media !== undefined) updateData.media = media;
    if (visibility !== undefined) updateData.visibility = visibility;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update post' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, error: 'Failed to update post' });
  }
});

// ============================================================================
// DELETE /api/posts/:id - Delete post
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete post' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

// ============================================================================
// POST /api/posts/:id/like - Like a post
// ============================================================================
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const likes = post.likes || [];
    if (!likes.includes(userId)) {
      likes.push(userId);
      await supabase
        .from('posts')
        .update({ likes, updated_at: new Date().toISOString() })
        .eq('id', postId);
    }

    res.json({ success: true, likesCount: likes.length });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, error: 'Failed to like post' });
  }
});

// ============================================================================
// DELETE /api/posts/:id/like - Unlike a post
// ============================================================================
router.delete('/:id/like', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const likes = (post.likes || []).filter((id: string) => id !== userId);
    await supabase
      .from('posts')
      .update({ likes, updated_at: new Date().toISOString() })
      .eq('id', postId);

    res.json({ success: true, likesCount: likes.length });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ success: false, error: 'Failed to unlike post' });
  }
});

// ============================================================================
// POST /api/posts/:id/comments - Add comment to post
// ============================================================================
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'authorId and content are required' 
      });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .select('comments')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const newComment = {
      id: uuidv4(),
      authorId,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
    };

    const comments = post.comments || [];
    comments.push(newComment);

    await supabase
      .from('posts')
      .update({ comments, updated_at: new Date().toISOString() })
      .eq('id', postId);

    // Get author details for the comment
    const { data: author } = await supabase
      .from('users')
      .select('id, username, display_name, avatar')
      .eq('id', authorId)
      .single();

    const commentWithAuthor = {
      ...newComment,
      author: author ? {
        id: author.id,
        username: author.username,
        displayName: author.display_name,
        avatar: author.avatar,
      } : null,
    };

    res.status(201).json({ success: true, data: commentWithAuthor });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
});

export default router;
