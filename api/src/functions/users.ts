import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { User, ApiResponse, PaginatedResponse } from '../types';

// ============================================================================
// GET /api/users/:id - Get user by ID
// ============================================================================
app.http('getUserById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.id;
      const viewerId = request.query.get('viewerId'); // Who's viewing the profile

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      // Prepare public profile (hide sensitive data)
      const publicProfile: any = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        skills: user.skills,
        isFreelancer: user.isFreelancer,
        isVerified: user.isVerified,
        connectionsCount: user.connections?.length || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        createdAt: user.createdAt,
      };

      // Add freelancer profile if user is a freelancer (hide bank info)
      if (user.isFreelancer && user.freelancerProfile) {
        publicProfile.freelancerProfile = {
          title: user.freelancerProfile.title,
          hourlyRate: user.freelancerProfile.hourlyRate,
          availability: user.freelancerProfile.availability,
          completedJobs: user.freelancerProfile.completedJobs,
          rating: user.freelancerProfile.rating,
          totalReviews: user.freelancerProfile.totalReviews,
        };
      }

      // Add relationship info if viewerId provided
      if (viewerId && viewerId !== userId) {
        publicProfile.isFollowing = user.followers?.includes(viewerId) || false;
        publicProfile.isFollower = user.following?.includes(viewerId) || false;
        publicProfile.isConnected = user.connections?.includes(viewerId) || false;
      }

      return {
        status: 200,
        jsonBody: { success: true, data: publicProfile } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/users/username/:username - Get user by username
// ============================================================================
app.http('getUserByUsername', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/username/{username}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const username = request.params.username;

      const { resources: users } = await containers.users.items
        .query({
          query: 'SELECT * FROM c WHERE c.username = @username',
          parameters: [{ name: '@username', value: username }],
        })
        .fetchAll();

      if (users.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const user = users[0] as User;

      // Return public profile
      const publicProfile: any = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        bio: user.bio,
        skills: user.skills,
        isFreelancer: user.isFreelancer,
        isVerified: user.isVerified,
        connectionsCount: user.connections?.length || 0,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        createdAt: user.createdAt,
      };

      if (user.isFreelancer && user.freelancerProfile) {
        publicProfile.freelancerProfile = {
          title: user.freelancerProfile.title,
          hourlyRate: user.freelancerProfile.hourlyRate,
          availability: user.freelancerProfile.availability,
          completedJobs: user.freelancerProfile.completedJobs,
          rating: user.freelancerProfile.rating,
          totalReviews: user.freelancerProfile.totalReviews,
        };
      }

      return {
        status: 200,
        jsonBody: { success: true, data: publicProfile } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/users/:id - Update user profile
// ============================================================================
app.http('updateUser', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'users/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.id;
      const body = (await request.json()) as Partial<User>;

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Update allowed fields only
      if (body.displayName !== undefined) user.displayName = body.displayName.trim();
      if (body.bio !== undefined) user.bio = body.bio?.trim();
      if (body.avatar !== undefined) user.avatar = body.avatar;
      if (body.coverPhoto !== undefined) user.coverPhoto = body.coverPhoto;
      if (body.skills !== undefined) user.skills = body.skills;

      user.updatedAt = now;

      await containers.users.item(userId, userId).replace(user);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            coverPhoto: user.coverPhoto,
            bio: user.bio,
            skills: user.skills,
            isFreelancer: user.isFreelancer,
          },
          message: 'Profile updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update profile' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/users/:id/follow - Follow a user
// ============================================================================
app.http('followUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users/{id}/follow',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const targetUserId = request.params.id;
      const body = (await request.json()) as { followerId: string };

      if (!body.followerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Follower ID is required' } as ApiResponse,
        };
      }

      if (targetUserId === body.followerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'You cannot follow yourself' } as ApiResponse,
        };
      }

      // Get both users
      const [targetResult, followerResult] = await Promise.all([
        containers.users.item(targetUserId, targetUserId).read<User>(),
        containers.users.item(body.followerId, body.followerId).read<User>(),
      ]);

      const targetUser = targetResult.resource;
      const follower = followerResult.resource;

      if (!targetUser || !follower) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Check if already following
      if (targetUser.followers?.includes(body.followerId)) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Already following this user' } as ApiResponse,
        };
      }

      // Add follower
      if (!targetUser.followers) targetUser.followers = [];
      targetUser.followers.push(body.followerId);
      targetUser.updatedAt = now;

      // Add to following
      if (!follower.following) follower.following = [];
      follower.following.push(targetUserId);
      follower.updatedAt = now;

      // Save both
      await Promise.all([
        containers.users.item(targetUserId, targetUserId).replace(targetUser),
        containers.users.item(body.followerId, body.followerId).replace(follower),
      ]);

      return {
        status: 200,
        jsonBody: {
          success: true,
          message: `You are now following ${targetUser.displayName}`,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error following user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to follow user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/users/:id/follow - Unfollow a user
// ============================================================================
app.http('unfollowUser', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'users/{id}/follow',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const targetUserId = request.params.id;
      const followerId = request.query.get('followerId');

      if (!followerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Follower ID is required' } as ApiResponse,
        };
      }

      // Get both users
      const [targetResult, followerResult] = await Promise.all([
        containers.users.item(targetUserId, targetUserId).read<User>(),
        containers.users.item(followerId, followerId).read<User>(),
      ]);

      const targetUser = targetResult.resource;
      const follower = followerResult.resource;

      if (!targetUser || !follower) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Remove follower
      if (targetUser.followers) {
        targetUser.followers = targetUser.followers.filter(id => id !== followerId);
        targetUser.updatedAt = now;
      }

      // Remove from following
      if (follower.following) {
        follower.following = follower.following.filter(id => id !== targetUserId);
        follower.updatedAt = now;
      }

      // Save both
      await Promise.all([
        containers.users.item(targetUserId, targetUserId).replace(targetUser),
        containers.users.item(followerId, followerId).replace(follower),
      ]);

      return {
        status: 200,
        jsonBody: {
          success: true,
          message: `You have unfollowed ${targetUser.displayName}`,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error unfollowing user:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to unfollow user' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/users/:id/followers - Get user's followers
// ============================================================================
app.http('getUserFollowers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{id}/followers',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.id;
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const followers = user.followers || [];
      const total = followers.length;
      const start = (page - 1) * pageSize;
      const paginatedIds = followers.slice(start, start + pageSize);

      if (paginatedIds.length === 0) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            data: [],
            pagination: {
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
              hasNext: false,
              hasPrev: page > 1,
            },
          } as PaginatedResponse<any>,
        };
      }

      // Fetch follower details
      const query = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.isFreelancer, c.freelancerProfile.title, c.freelancerProfile.rating FROM c WHERE c.id IN (${paginatedIds.map((_, i) => `@id${i}`).join(',')})`;
      const params = paginatedIds.map((id, i) => ({ name: `@id${i}`, value: id }));

      const { resources: followerUsers } = await containers.users.items
        .query({ query, parameters: params })
        .fetchAll();

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: followerUsers,
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasNext: start + paginatedIds.length < total,
            hasPrev: page > 1,
          },
        } as PaginatedResponse<any>,
      };
    } catch (error) {
      context.error('Error fetching followers:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch followers' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/users/:id/following - Get users the user is following
// ============================================================================
app.http('getUserFollowing', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/{id}/following',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.params.id;
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);

      const { resource: user } = await containers.users.item(userId, userId).read<User>();

      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      const following = user.following || [];
      const total = following.length;
      const start = (page - 1) * pageSize;
      const paginatedIds = following.slice(start, start + pageSize);

      if (paginatedIds.length === 0) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            data: [],
            pagination: {
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
              hasNext: false,
              hasPrev: page > 1,
            },
          } as PaginatedResponse<any>,
        };
      }

      // Fetch following details
      const query = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.isFreelancer, c.freelancerProfile.title, c.freelancerProfile.rating FROM c WHERE c.id IN (${paginatedIds.map((_, i) => `@id${i}`).join(',')})`;
      const params = paginatedIds.map((id, i) => ({ name: `@id${i}`, value: id }));

      const { resources: followingUsers } = await containers.users.items
        .query({ query, parameters: params })
        .fetchAll();

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: followingUsers,
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasNext: start + paginatedIds.length < total,
            hasPrev: page > 1,
          },
        } as PaginatedResponse<any>,
      };
    } catch (error) {
      context.error('Error fetching following:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch following' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/users/search - Search users
// ============================================================================
app.http('searchUsers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users/search',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const search = request.query.get('q') || request.query.get('search');
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const offset = (page - 1) * pageSize;

      if (!search || search.length < 2) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Search query must be at least 2 characters' } as ApiResponse,
        };
      }

      let query = 'SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.isFreelancer, c.bio, c.skills FROM c WHERE CONTAINS(LOWER(c.username), LOWER(@search)) OR CONTAINS(LOWER(c.displayName), LOWER(@search))';
      const parameters: { name: string; value: string | number }[] = [{ name: '@search', value: search }];

      // Get total count
      const countQuery = query.replace('SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.isFreelancer, c.bio, c.skills', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.users.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add pagination
      query += ' OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: users } = await containers.users.items
        .query({ query, parameters })
        .fetchAll();

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: users,
          pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            hasNext: offset + users.length < total,
            hasPrev: page > 1,
          },
        } as PaginatedResponse<any>,
      };
    } catch (error) {
      context.error('Error searching users:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to search users' } as ApiResponse,
      };
    }
  },
});
