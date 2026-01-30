import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';

const router = Router();

// Cache for stats (5 minutes)
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// GET /api/stats - Get platform statistics
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check cache
    if (statsCache && Date.now() - statsCache.timestamp < CACHE_DURATION) {
      return res.json({ success: true, data: statsCache.data, cached: true });
    }

    // Count freelancers (users with is_freelancer = true)
    const { count: freelancersCount, error: freelancersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_freelancer', true);

    // Count projects (freelance jobs with status not 'cancelled')
    const { count: projectsCount, error: projectsError } = await supabase
      .from('freelance_jobs')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelled');

    // Count total users
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Count completed projects
    const { count: completedCount, error: completedError } = await supabase
      .from('freelance_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const stats = {
      freelancers: freelancersCount || 0,
      projects: projectsCount || 0,
      users: usersCount || 0,
      completedProjects: completedCount || 0,
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    statsCache = { data: stats, timestamp: Date.now() };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

export default router;
