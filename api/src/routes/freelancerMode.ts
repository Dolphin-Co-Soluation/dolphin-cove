import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';

const router = Router();

// ============================================================================
// GET /api/freelancer-mode/:userId - Get freelancer mode status
// ============================================================================
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('is_freelancer, freelancer_profile')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        isFreelancer: user.is_freelancer,
        profile: user.freelancer_profile,
      },
    });
  } catch (error) {
    console.error('Error fetching freelancer mode:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch freelancer mode' });
  }
});

// ============================================================================
// POST /api/freelancer-mode/:userId/enable - Enable freelancer mode
// ============================================================================
router.post('/:userId/enable', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { title, hourlyRate, availability } = req.body;

    const freelancerProfile = {
      title: title || '',
      hourly_rate: hourlyRate || 0,
      availability: availability || 'available',
      completed_jobs: 0,
      rating: 0,
      total_reviews: 0,
      bank_info: null,
    };

    const { data, error } = await supabase
      .from('users')
      .update({
        is_freelancer: true,
        freelancer_profile: freelancerProfile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('is_freelancer, freelancer_profile')
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to enable freelancer mode' });
    }

    res.json({
      success: true,
      data: {
        isFreelancer: data.is_freelancer,
        profile: data.freelancer_profile,
      },
    });
  } catch (error) {
    console.error('Error enabling freelancer mode:', error);
    res.status(500).json({ success: false, error: 'Failed to enable freelancer mode' });
  }
});

// ============================================================================
// POST /api/freelancer-mode/:userId/disable - Disable freelancer mode
// ============================================================================
router.post('/:userId/disable', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const { data, error } = await supabase
      .from('users')
      .update({
        is_freelancer: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('is_freelancer')
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to disable freelancer mode' });
    }

    res.json({
      success: true,
      data: {
        isFreelancer: data.is_freelancer,
      },
    });
  } catch (error) {
    console.error('Error disabling freelancer mode:', error);
    res.status(500).json({ success: false, error: 'Failed to disable freelancer mode' });
  }
});

// ============================================================================
// PUT /api/freelancer-mode/:userId/profile - Update freelancer profile
// ============================================================================
router.put('/:userId/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { title, hourlyRate, availability, bankInfo } = req.body;

    // Get current profile
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('freelancer_profile')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const currentProfile = user.freelancer_profile || {};
    const updatedProfile = {
      ...currentProfile,
      title: title !== undefined ? title : currentProfile.title,
      hourly_rate: hourlyRate !== undefined ? hourlyRate : currentProfile.hourly_rate,
      availability: availability !== undefined ? availability : currentProfile.availability,
    };

    // Handle bank info separately (sensitive data)
    if (bankInfo) {
      updatedProfile.bank_info = {
        bank_name: bankInfo.bankName,
        account_number: bankInfo.accountNumber, // In production, encrypt this!
        account_holder_name: bankInfo.accountHolderName,
        ifsc_code: bankInfo.ifscCode,
        swift_code: bankInfo.swiftCode,
        routing_number: bankInfo.routingNumber,
        is_verified: false,
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        freelancer_profile: updatedProfile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('freelancer_profile')
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update profile' });
    }

    // Return profile without sensitive bank info
    const safeProfile = {
      ...data.freelancer_profile,
      bank_info: data.freelancer_profile?.bank_info ? {
        bank_name: data.freelancer_profile.bank_info.bank_name,
        is_verified: data.freelancer_profile.bank_info.is_verified,
        // Hide sensitive fields
        account_number: '****' + (data.freelancer_profile.bank_info.account_number?.slice(-4) || ''),
      } : null,
    };

    res.json({ success: true, data: safeProfile });
  } catch (error) {
    console.error('Error updating freelancer profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ============================================================================
// GET /api/freelancer-mode/freelancers - Get all freelancers (public)
// ============================================================================
router.get('/freelancers/list', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50);
    const skills = (req.query.skills as string)?.split(',');
    const availability = req.query.availability as string;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('users')
      .select('id, username, display_name, avatar, skills, is_verified, freelancer_profile', { count: 'exact' })
      .eq('is_freelancer', true);

    if (availability) {
      query = query.eq('freelancer_profile->availability', availability);
    }

    const { data: freelancers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    // Filter by skills if provided (in memory for simplicity)
    let filteredFreelancers = freelancers || [];
    if (skills && skills.length > 0) {
      filteredFreelancers = filteredFreelancers.filter(f =>
        skills.some(skill => f.skills?.includes(skill.trim()))
      );
    }

    const formattedFreelancers = filteredFreelancers.map(f => ({
      id: f.id,
      username: f.username,
      displayName: f.display_name,
      avatar: f.avatar,
      skills: f.skills || [],
      isVerified: f.is_verified,
      freelancerProfile: f.freelancer_profile ? {
        title: f.freelancer_profile.title,
        hourlyRate: f.freelancer_profile.hourly_rate,
        availability: f.freelancer_profile.availability,
        completedJobs: f.freelancer_profile.completed_jobs,
        rating: f.freelancer_profile.rating,
        totalReviews: f.freelancer_profile.total_reviews,
      } : null,
    }));

    res.json({
      success: true,
      data: formattedFreelancers,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch freelancers' });
  }
});

export default router;
