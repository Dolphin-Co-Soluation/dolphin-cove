import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/users/:id - Get user by ID
// ============================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const viewerId = req.query.viewerId as string;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prepare public profile (hide sensitive data)
    const publicProfile: any = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar,
      coverPhoto: user.cover_photo,
      bio: user.bio,
      skills: user.skills || [],
      isFreelancer: user.is_freelancer,
      isVerified: user.is_verified,
      connectionsCount: user.connections?.length || 0,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      createdAt: user.created_at,
    };

    // Add freelancer profile if user is a freelancer
    if (user.is_freelancer && user.freelancer_profile) {
      publicProfile.freelancerProfile = {
        title: user.freelancer_profile.title,
        hourlyRate: user.freelancer_profile.hourly_rate,
        availability: user.freelancer_profile.availability,
        completedJobs: user.freelancer_profile.completed_jobs,
        rating: user.freelancer_profile.rating,
        totalReviews: user.freelancer_profile.total_reviews,
      };
    }

    // Add relationship info if viewerId provided
    if (viewerId && viewerId !== userId) {
      publicProfile.isFollowing = user.followers?.includes(viewerId) || false;
      publicProfile.isFollower = user.following?.includes(viewerId) || false;
      publicProfile.isConnected = user.connections?.includes(viewerId) || false;
    }

    res.json({ success: true, data: publicProfile });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// ============================================================================
// GET /api/users/username/:username - Get user by username
// ============================================================================
router.get('/username/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const publicProfile: any = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar,
      coverPhoto: user.cover_photo,
      bio: user.bio,
      skills: user.skills || [],
      isFreelancer: user.is_freelancer,
      isVerified: user.is_verified,
      connectionsCount: user.connections?.length || 0,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      createdAt: user.created_at,
    };

    if (user.is_freelancer && user.freelancer_profile) {
      publicProfile.freelancerProfile = {
        title: user.freelancer_profile.title,
        hourlyRate: user.freelancer_profile.hourly_rate,
        availability: user.freelancer_profile.availability,
        completedJobs: user.freelancer_profile.completed_jobs,
        rating: user.freelancer_profile.rating,
        totalReviews: user.freelancer_profile.total_reviews,
      };
    }

    res.json({ success: true, data: publicProfile });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// ============================================================================
// POST /api/users/register - Register new user
// ============================================================================
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, displayName } = req.body;

    // Validate required fields
    if (!email || !username || !password || !displayName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, username, password, and displayName are required' 
      });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return res.status(409).json({ success: false, error: 'Username already taken' });
    }

    const userId = uuidv4();
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email,
      username,
      password_hash: password, // In production, hash this password!
      display_name: displayName,
      avatar: null,
      cover_photo: null,
      bio: '',
      skills: [],
      is_freelancer: false,
      freelancer_profile: null,
      connections: [],
      followers: [],
      following: [],
      is_verified: false,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }

    // Return user without password
    const { password_hash, ...userWithoutPassword } = data;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
});

// ============================================================================
// POST /api/users/login - Login user
// ============================================================================
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // In production, compare hashed passwords!
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
});

// ============================================================================
// PUT /api/users/:id - Update user profile
// ============================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = ['display_name', 'avatar', 'cover_photo', 'bio', 'skills'];
    const updateData: any = { updated_at: new Date().toISOString() };

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }

    // Handle camelCase to snake_case conversion
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.coverPhoto !== undefined) updateData.cover_photo = updates.coverPhoto;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update user' });
    }

    const { password_hash, ...userWithoutPassword } = data;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// ============================================================================
// POST /api/users/:id/follow - Follow a user
// ============================================================================
router.post('/:id/follow', async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ success: false, error: 'followerId is required' });
    }

    if (followerId === targetUserId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    // Get both users
    const { data: targetUser } = await supabase
      .from('users')
      .select('followers')
      .eq('id', targetUserId)
      .single();

    const { data: followerUser } = await supabase
      .from('users')
      .select('following')
      .eq('id', followerId)
      .single();

    if (!targetUser || !followerUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update followers of target user
    const followers = targetUser.followers || [];
    if (!followers.includes(followerId)) {
      followers.push(followerId);
      await supabase
        .from('users')
        .update({ followers, updated_at: new Date().toISOString() })
        .eq('id', targetUserId);
    }

    // Update following of follower user
    const following = followerUser.following || [];
    if (!following.includes(targetUserId)) {
      following.push(targetUserId);
      await supabase
        .from('users')
        .update({ following, updated_at: new Date().toISOString() })
        .eq('id', followerId);
    }

    res.json({ success: true, message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ success: false, error: 'Failed to follow user' });
  }
});

// ============================================================================
// DELETE /api/users/:id/follow - Unfollow a user
// ============================================================================
router.delete('/:id/follow', async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ success: false, error: 'followerId is required' });
    }

    // Get both users
    const { data: targetUser } = await supabase
      .from('users')
      .select('followers')
      .eq('id', targetUserId)
      .single();

    const { data: followerUser } = await supabase
      .from('users')
      .select('following')
      .eq('id', followerId)
      .single();

    if (!targetUser || !followerUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Remove from followers
    const followers = (targetUser.followers || []).filter((id: string) => id !== followerId);
    await supabase
      .from('users')
      .update({ followers, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    // Remove from following
    const following = (followerUser.following || []).filter((id: string) => id !== targetUserId);
    await supabase
      .from('users')
      .update({ following, updated_at: new Date().toISOString() })
      .eq('id', followerId);

    res.json({ success: true, message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ success: false, error: 'Failed to unfollow user' });
  }
});

export default router;
