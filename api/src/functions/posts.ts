import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { 
  Post, 
  User, 
  CreatePostRequest, 
  CreateCommentRequest,
  ApiResponse, 
  PaginatedResponse,
  PostWithAuthor,
  Comment
} from '../types';

// ============================================================================
// GET /api/posts - Get posts feed
// ============================================================================
app.http('getPosts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const authorId = request.query.get('authorId'); // Filter by author
      const viewerId = request.query.get('viewerId'); // Current user viewing
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM c WHERE c.visibility = "public"';
      const parameters: { name: string; value: string | number }[] = [];

      // If author specified, get their posts
      if (authorId) {
        query = 'SELECT * FROM c WHERE c.authorId = @authorId';
        parameters.push({ name: '@authorId', value: authorId });
        
        // If viewer is the author, show all their posts
        if (viewerId === authorId) {
          // No visibility filter - show all own posts
        } else if (viewerId) {
          // Check if connected to filter connections-only posts
          const { resource: viewer } = await containers.users.item(viewerId, viewerId).read<User>();
          if (viewer?.connections?.includes(authorId)) {
            query += ' AND (c.visibility = "public" OR c.visibility = "connections")';
          } else {
            query += ' AND c.visibility = "public"';
          }
        } else {
          query += ' AND c.visibility = "public"';
        }
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.posts.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add sorting and pagination
      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: posts } = await containers.posts.items
        .query({ query, parameters })
        .fetchAll();

      // Fetch author details
      const authorIds = [...new Set(posts.map((p: Post) => p.authorId))];
      const authorsMap: Record<string, User> = {};

      if (authorIds.length > 0) {
        const authorsQuery = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified FROM c WHERE c.id IN (${authorIds.map((_: string, i: number) => `@id${i}`).join(',')})`;
        const authorsParams = authorIds.map((id: string, i: number) => ({ name: `@id${i}`, value: id }));

        const { resources: authors } = await containers.users.items
          .query({ query: authorsQuery, parameters: authorsParams })
          .fetchAll();

        authors.forEach((author: User) => {
          authorsMap[author.id] = author;
        });
      }

      // Combine posts with authors
      const postsWithAuthors: PostWithAuthor[] = posts.map((post: Post) => {
        const author = authorsMap[post.authorId];
        return {
          ...post,
          author: author ? {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar,
            isVerified: author.isVerified,
          } : null,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
          isLiked: viewerId ? post.likes?.includes(viewerId) : false,
        };
      });

      const response: PaginatedResponse<PostWithAuthor> = {
        success: true,
        data: postsWithAuthors,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + posts.length < total,
          hasPrev: page > 1,
        },
      };

      return { status: 200, jsonBody: response };
    } catch (error) {
      context.error('Error fetching posts:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch posts' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/posts/:id - Get single post
// ============================================================================
app.http('getPostById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const viewerId = request.query.get('viewerId');

      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Check visibility
      if (post.visibility === 'private' && post.authorId !== viewerId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'This post is private' } as ApiResponse,
        };
      }

      // Fetch author
      const { resource: author } = await containers.users.item(post.authorId, post.authorId).read<User>();

      // Fetch comment authors
      const commentAuthorIds = [...new Set(post.comments?.map((c: Comment) => c.authorId) || [])];
      const commentAuthorsMap: Record<string, User> = {};

      if (commentAuthorIds.length > 0) {
        const authorsQuery = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified FROM c WHERE c.id IN (${commentAuthorIds.map((_: string, i: number) => `@id${i}`).join(',')})`;
        const authorsParams = commentAuthorIds.map((id: string, i: number) => ({ name: `@id${i}`, value: id }));

        const { resources: authors } = await containers.users.items
          .query({ query: authorsQuery, parameters: authorsParams })
          .fetchAll();

        authors.forEach((a: User) => {
          commentAuthorsMap[a.id] = a;
        });
      }

      const postWithDetails = {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar,
          isVerified: author.isVerified,
        } : null,
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        isLiked: viewerId ? post.likes?.includes(viewerId) : false,
        comments: post.comments?.map((comment: Comment) => ({
          ...comment,
          author: commentAuthorsMap[comment.authorId] ? {
            id: commentAuthorsMap[comment.authorId].id,
            username: commentAuthorsMap[comment.authorId].username,
            displayName: commentAuthorsMap[comment.authorId].displayName,
            avatar: commentAuthorsMap[comment.authorId].avatar,
          } : null,
          likesCount: comment.likes?.length || 0,
          isLiked: viewerId ? comment.likes?.includes(viewerId) : false,
        })),
      };

      return {
        status: 200,
        jsonBody: { success: true, data: postWithDetails } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/posts - Create new post
// ============================================================================
app.http('createPost', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as CreatePostRequest & { authorId: string };

      if (!body.authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      if (!body.content?.trim() && !body.images?.length && !body.videos?.length) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Post content or media is required' } as ApiResponse,
        };
      }

      // Verify author exists
      const { resource: author } = await containers.users.item(body.authorId, body.authorId).read<User>();
      if (!author) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const newPost: Post = {
        id: uuidv4(),
        authorId: body.authorId,
        content: body.content?.trim() || '',
        images: body.images || [],
        videos: body.videos || [],
        attachments: body.attachments || [],
        likes: [],
        comments: [],
        shares: 0,
        visibility: body.visibility || 'public',
        isEdited: false,
        createdAt: now,
        updatedAt: now,
      };

      const { resource: createdPost } = await containers.posts.items.create(newPost);

      const postWithAuthor = {
        ...createdPost,
        author: {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar,
          isVerified: author.isVerified,
        },
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      };

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: postWithAuthor,
          message: 'Post created successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error creating post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/posts/:id - Update post
// ============================================================================
app.http('updatePost', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const body = (await request.json()) as Partial<CreatePostRequest> & { authorId: string };

      if (!body.authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.authorId = @authorId',
          parameters: [
            { name: '@id', value: postId },
            { name: '@authorId', value: body.authorId },
          ],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found or you are not the author' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;
      const now = new Date().toISOString();

      // Update fields
      if (body.content !== undefined) post.content = body.content.trim();
      if (body.images !== undefined) post.images = body.images;
      if (body.videos !== undefined) post.videos = body.videos;
      if (body.visibility !== undefined) post.visibility = body.visibility;

      post.isEdited = true;
      post.updatedAt = now;

      await containers.posts.items.upsert(post);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: post,
          message: 'Post updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/posts/:id - Delete post
// ============================================================================
app.http('deletePost', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'posts/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const authorId = request.query.get('authorId');

      if (!authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.authorId = @authorId',
          parameters: [
            { name: '@id', value: postId },
            { name: '@authorId', value: authorId },
          ],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found or you are not the author' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;
      await containers.posts.item(postId, post.authorId).delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'Post deleted successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error deleting post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/posts/:id/like - Like a post
// ============================================================================
app.http('likePost', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/like',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const body = (await request.json()) as { userId: string };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Toggle like
      if (!post.likes) post.likes = [];
      
      const likeIndex = post.likes.indexOf(body.userId);
      let action: string;

      if (likeIndex === -1) {
        post.likes.push(body.userId);
        action = 'liked';
      } else {
        post.likes.splice(likeIndex, 1);
        action = 'unliked';
      }

      post.updatedAt = new Date().toISOString();
      await containers.posts.items.upsert(post);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            likesCount: post.likes.length,
            isLiked: action === 'liked',
          },
          message: `Post ${action}`,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error liking post:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to like post' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/posts/:id/comments - Add comment to post
// ============================================================================
app.http('addComment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/comments',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const body = (await request.json()) as CreateCommentRequest & { authorId: string };

      if (!body.authorId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Author ID is required' } as ApiResponse,
        };
      }

      if (!body.content?.trim()) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Comment content is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Get comment author
      const { resource: author } = await containers.users.item(body.authorId, body.authorId).read<User>();
      if (!author) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const newComment: Comment = {
        id: uuidv4(),
        authorId: body.authorId,
        content: body.content.trim(),
        likes: [],
        replies: [],
        createdAt: now,
        updatedAt: now,
      };

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
      post.updatedAt = now;

      await containers.posts.items.upsert(post);

      const commentWithAuthor = {
        ...newComment,
        author: {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar,
        },
        likesCount: 0,
        isLiked: false,
      };

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: commentWithAuthor,
          message: 'Comment added successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error adding comment:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to add comment' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/posts/:id/comments/:commentId - Delete comment
// ============================================================================
app.http('deleteComment', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'posts/{id}/comments/{commentId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const commentId = request.params.commentId;
      const userId = request.query.get('userId');

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Find the comment
      const commentIndex = post.comments?.findIndex((c: Comment) => c.id === commentId);
      if (commentIndex === undefined || commentIndex === -1) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Comment not found' } as ApiResponse,
        };
      }

      const comment = post.comments![commentIndex];

      // Check if user is comment author or post author
      if (comment.authorId !== userId && post.authorId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You can only delete your own comments' } as ApiResponse,
        };
      }

      // Remove comment
      post.comments!.splice(commentIndex, 1);
      post.updatedAt = new Date().toISOString();

      await containers.posts.items.upsert(post);

      return {
        status: 200,
        jsonBody: { success: true, message: 'Comment deleted successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error deleting comment:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete comment' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/posts/:id/comments/:commentId/like - Like a comment
// ============================================================================
app.http('likeComment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'posts/{id}/comments/{commentId}/like',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const postId = request.params.id;
      const commentId = request.params.commentId;
      const body = (await request.json()) as { userId: string };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the post
      const { resources: posts } = await containers.posts.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: postId }],
        })
        .fetchAll();

      if (posts.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Post not found' } as ApiResponse,
        };
      }

      const post = posts[0] as Post;

      // Find the comment
      const comment = post.comments?.find((c: Comment) => c.id === commentId);
      if (!comment) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Comment not found' } as ApiResponse,
        };
      }

      // Toggle like
      if (!comment.likes) comment.likes = [];
      
      const likeIndex = comment.likes.indexOf(body.userId);
      let action: string;

      if (likeIndex === -1) {
        comment.likes.push(body.userId);
        action = 'liked';
      } else {
        comment.likes.splice(likeIndex, 1);
        action = 'unliked';
      }

      post.updatedAt = new Date().toISOString();
      await containers.posts.items.upsert(post);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            likesCount: comment.likes.length,
            isLiked: action === 'liked',
          },
          message: `Comment ${action}`,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error liking comment:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to like comment' } as ApiResponse,
      };
    }
  },
});
