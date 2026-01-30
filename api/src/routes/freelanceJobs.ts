import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/freelance-jobs - Get all freelance jobs (public)
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50);
    const status = req.query.status as string || 'open';
    const skills = (req.query.skills as string)?.split(',');
    const minBudget = req.query.minBudget as string;
    const maxBudget = req.query.maxBudget as string;
    const experienceLevel = req.query.experienceLevel as string;
    const search = req.query.search as string;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('freelance_jobs')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .eq('visibility', 'public');

    // Search in title and description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by budget range
    if (minBudget) {
      query = query.gte('budget_amount', parseFloat(minBudget));
    }
    if (maxBudget) {
      query = query.lte('budget_amount', parseFloat(maxBudget));
    }

    // Filter by experience level
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    // Get paginated jobs
    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    // Filter by skills (done in memory since Supabase array contains is complex)
    let filteredJobs = jobs || [];
    if (skills && skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        skills.some(skill => job.skills?.includes(skill.trim()))
      );
    }

    // Fetch client details
    const clientIds = [...new Set(filteredJobs.map(j => j.client_id))];
    let clientsMap: Record<string, any> = {};

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('users')
        .select('id, username, display_name, avatar, is_verified')
        .in('id', clientIds);

      if (clients) {
        clients.forEach(client => {
          clientsMap[client.id] = client;
        });
      }
    }

    // Combine jobs with clients
    const jobsWithClients = filteredJobs.map(job => {
      const client = clientsMap[job.client_id];
      return {
        id: job.id,
        clientId: job.client_id,
        title: job.title,
        description: job.description,
        skills: job.skills || [],
        experienceLevel: job.experience_level,
        budget: {
          amount: job.budget_amount,
          currency: job.budget_currency,
          type: job.budget_type,
        },
        duration: {
          value: job.duration_value,
          unit: job.duration_unit,
        },
        deadline: job.deadline,
        status: job.status,
        visibility: job.visibility,
        applicationsCount: job.applications?.length || 0,
        createdAt: job.created_at,
        client: client ? {
          id: client.id,
          username: client.username,
          displayName: client.display_name,
          avatar: client.avatar,
          isVerified: client.is_verified,
        } : null,
      };
    });

    res.json({
      success: true,
      data: jobsWithClients,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching freelance jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// ============================================================================
// GET /api/freelance-jobs/:id - Get single job
// ============================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;

    const { data: job, error } = await supabase
      .from('freelance_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Get client details
    const { data: client } = await supabase
      .from('users')
      .select('id, username, display_name, avatar, is_verified')
      .eq('id', job.client_id)
      .single();

    const jobWithClient = {
      id: job.id,
      clientId: job.client_id,
      title: job.title,
      description: job.description,
      skills: job.skills || [],
      experienceLevel: job.experience_level,
      budget: {
        amount: job.budget_amount,
        currency: job.budget_currency,
        type: job.budget_type,
      },
      duration: {
        value: job.duration_value,
        unit: job.duration_unit,
      },
      deadline: job.deadline,
      attachments: job.attachments || [],
      status: job.status,
      visibility: job.visibility,
      applications: job.applications || [],
      applicationsCount: job.applications?.length || 0,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      client: client ? {
        id: client.id,
        username: client.username,
        displayName: client.display_name,
        avatar: client.avatar,
        isVerified: client.is_verified,
      } : null,
    };

    res.json({ success: true, data: jobWithClient });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job' });
  }
});

// ============================================================================
// POST /api/freelance-jobs - Create new job
// ============================================================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      title,
      description,
      skills,
      experienceLevel,
      budget,
      duration,
      deadline,
      attachments,
      visibility,
    } = req.body;

    if (!clientId || !title || !description || !budget) {
      return res.status(400).json({ 
        success: false, 
        error: 'clientId, title, description, and budget are required' 
      });
    }

    const jobId = uuidv4();
    const now = new Date().toISOString();

    const newJob = {
      id: jobId,
      client_id: clientId,
      title,
      description,
      skills: skills || [],
      experience_level: experienceLevel || 'intermediate',
      budget_amount: budget.amount,
      budget_currency: budget.currency || 'USD',
      budget_type: budget.type || 'fixed',
      duration_value: duration?.value || 1,
      duration_unit: duration?.unit || 'weeks',
      deadline: deadline || null,
      attachments: attachments || [],
      status: 'open',
      visibility: visibility || 'public',
      applications: [],
      hired_freelancer_id: null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('freelance_jobs')
      .insert(newJob)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, error: 'Failed to create job' });
  }
});

// ============================================================================
// PUT /api/freelance-jobs/:id - Update job
// ============================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const updates = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.skills !== undefined) updateData.skills = updates.skills;
    if (updates.experienceLevel !== undefined) updateData.experience_level = updates.experienceLevel;
    if (updates.budget) {
      if (updates.budget.amount !== undefined) updateData.budget_amount = updates.budget.amount;
      if (updates.budget.currency !== undefined) updateData.budget_currency = updates.budget.currency;
      if (updates.budget.type !== undefined) updateData.budget_type = updates.budget.type;
    }
    if (updates.duration) {
      if (updates.duration.value !== undefined) updateData.duration_value = updates.duration.value;
      if (updates.duration.unit !== undefined) updateData.duration_unit = updates.duration.unit;
    }
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;

    const { data, error } = await supabase
      .from('freelance_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update job' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, error: 'Failed to update job' });
  }
});

// ============================================================================
// DELETE /api/freelance-jobs/:id - Delete job
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;

    const { error } = await supabase
      .from('freelance_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete job' });
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, error: 'Failed to delete job' });
  }
});

// ============================================================================
// POST /api/freelance-jobs/:id/apply - Apply to job
// ============================================================================
router.post('/:id/apply', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const { freelancerId, coverLetter, proposedBudget, estimatedDuration } = req.body;

    if (!freelancerId || !coverLetter) {
      return res.status(400).json({ 
        success: false, 
        error: 'freelancerId and coverLetter are required' 
      });
    }

    // Get the job
    const { data: job, error } = await supabase
      .from('freelance_jobs')
      .select('applications, status')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Job is not open for applications' });
    }

    // Check if already applied
    const applications = job.applications || [];
    if (applications.some((app: any) => app.freelancer_id === freelancerId)) {
      return res.status(400).json({ success: false, error: 'You have already applied to this job' });
    }

    const application = {
      id: uuidv4(),
      freelancer_id: freelancerId,
      cover_letter: coverLetter,
      proposed_budget: proposedBudget,
      estimated_duration: estimatedDuration,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    applications.push(application);

    await supabase
      .from('freelance_jobs')
      .update({ applications, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ success: false, error: 'Failed to apply to job' });
  }
});

// ============================================================================
// GET /api/freelance-jobs/:id/applications - Get job applications (for client)
// ============================================================================
router.get('/:id/applications', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const clientId = req.query.clientId as string;

    const { data: job, error } = await supabase
      .from('freelance_jobs')
      .select('applications, client_id')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Verify the requester is the job owner
    if (clientId && job.client_id !== clientId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view applications' });
    }

    const applications = job.applications || [];

    // Fetch freelancer details for each application
    const freelancerIds = applications.map((app: any) => app.freelancer_id);
    let freelancersMap: Record<string, any> = {};

    if (freelancerIds.length > 0) {
      const { data: freelancers } = await supabase
        .from('users')
        .select('id, username, display_name, avatar, is_verified, freelancer_profile')
        .in('id', freelancerIds);

      if (freelancers) {
        freelancers.forEach(freelancer => {
          freelancersMap[freelancer.id] = freelancer;
        });
      }
    }

    const applicationsWithFreelancers = applications.map((app: any) => {
      const freelancer = freelancersMap[app.freelancer_id];
      return {
        id: app.id,
        freelancerId: app.freelancer_id,
        coverLetter: app.cover_letter,
        proposedBudget: app.proposed_budget,
        estimatedDuration: app.estimated_duration,
        status: app.status,
        createdAt: app.created_at,
        freelancer: freelancer ? {
          id: freelancer.id,
          username: freelancer.username,
          displayName: freelancer.display_name,
          avatar: freelancer.avatar,
          isVerified: freelancer.is_verified,
          freelancerProfile: freelancer.freelancer_profile,
        } : null,
      };
    });

    res.json({ success: true, data: applicationsWithFreelancers });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

// ============================================================================
// POST /api/freelance-jobs/:id/hire - Hire a freelancer
// ============================================================================
router.post('/:id/hire', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const { freelancerId, clientId } = req.body;

    if (!freelancerId || !clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'freelancerId and clientId are required' 
      });
    }

    const { data: job, error } = await supabase
      .from('freelance_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.client_id !== clientId) {
      return res.status(403).json({ success: false, error: 'Not authorized to hire for this job' });
    }

    // Update application status
    const applications = job.applications || [];
    const updatedApplications = applications.map((app: any) => ({
      ...app,
      status: app.freelancer_id === freelancerId ? 'accepted' : 'rejected',
    }));

    await supabase
      .from('freelance_jobs')
      .update({
        hired_freelancer_id: freelancerId,
        status: 'in_progress',
        applications: updatedApplications,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    res.json({ success: true, message: 'Freelancer hired successfully' });
  } catch (error) {
    console.error('Error hiring freelancer:', error);
    res.status(500).json({ success: false, error: 'Failed to hire freelancer' });
  }
});

// ============================================================================
// GET /api/freelance-jobs/my-jobs/:userId - Get jobs created by user
// ============================================================================
router.get('/my-jobs/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50);
    const offset = (page - 1) * pageSize;

    const { data: jobs, error, count } = await supabase
      .from('freelance_jobs')
      .select('*', { count: 'exact' })
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    const formattedJobs = (jobs || []).map(job => ({
      id: job.id,
      clientId: job.client_id,
      title: job.title,
      description: job.description,
      skills: job.skills || [],
      experienceLevel: job.experience_level,
      budget: {
        amount: job.budget_amount,
        currency: job.budget_currency,
        type: job.budget_type,
      },
      status: job.status,
      applicationsCount: job.applications?.length || 0,
      createdAt: job.created_at,
    }));

    res.json({
      success: true,
      data: formattedJobs,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching my jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

// ============================================================================
// GET /api/freelance-jobs/my-applications/:userId - Get user's applications
// ============================================================================
router.get('/my-applications/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Get all jobs and filter for user's applications
    const { data: jobs, error } = await supabase
      .from('freelance_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Filter jobs where user has applied
    const appliedJobs = (jobs || []).filter(job =>
      job.applications?.some((app: any) => app.freelancer_id === userId)
    );

    // Get client details
    const clientIds = [...new Set(appliedJobs.map(j => j.client_id))];
    let clientsMap: Record<string, any> = {};

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('users')
        .select('id, username, display_name, avatar, is_verified')
        .in('id', clientIds);

      if (clients) {
        clients.forEach(client => {
          clientsMap[client.id] = client;
        });
      }
    }

    const applications = appliedJobs.map(job => {
      const application = job.applications.find((app: any) => app.freelancer_id === userId);
      const client = clientsMap[job.client_id];

      return {
        applicationId: application.id,
        jobId: job.id,
        jobTitle: job.title,
        jobStatus: job.status,
        applicationStatus: application.status,
        coverLetter: application.cover_letter,
        proposedBudget: application.proposed_budget,
        appliedAt: application.created_at,
        client: client ? {
          id: client.id,
          username: client.username,
          displayName: client.display_name,
          avatar: client.avatar,
          isVerified: client.is_verified,
        } : null,
      };
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

export default router;
