import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import {
  FreelanceJob,
  CreateFreelanceJobRequest,
  ApplyToJobRequest,
  HireFreelancerRequest,
  ApiResponse,
  PaginatedResponse,
  FreelanceJobWithClient,
  ApplicationWithFreelancer,
  User,
  Task,
  JobApplication
} from '../types';

// ============================================================================
// GET /api/freelance-jobs - Get all freelance jobs (public)
// ============================================================================
app.http('getFreelanceJobs', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelance-jobs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const status = request.query.get('status') || 'open';
      const skills = request.query.get('skills')?.split(',');
      const minBudget = request.query.get('minBudget');
      const maxBudget = request.query.get('maxBudget');
      const experienceLevel = request.query.get('experienceLevel');
      const search = request.query.get('search');
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM c WHERE c.status = @status AND c.visibility = "public"';
      const parameters: { name: string; value: any }[] = [
        { name: '@status', value: status }
      ];

      // Search in title and description
      if (search) {
        query += ' AND (CONTAINS(LOWER(c.title), LOWER(@search)) OR CONTAINS(LOWER(c.description), LOWER(@search)))';
        parameters.push({ name: '@search', value: search });
      }

      // Filter by skills
      if (skills && skills.length > 0) {
        const skillConditions = skills.map((_, i) => `ARRAY_CONTAINS(c.skills, @skill${i})`).join(' OR ');
        query += ` AND (${skillConditions})`;
        skills.forEach((skill, i) => {
          parameters.push({ name: `@skill${i}`, value: skill.trim() });
        });
      }

      // Filter by budget range
      if (minBudget) {
        query += ' AND c.budget.amount >= @minBudget';
        parameters.push({ name: '@minBudget', value: parseFloat(minBudget) });
      }
      if (maxBudget) {
        query += ' AND c.budget.amount <= @maxBudget';
        parameters.push({ name: '@maxBudget', value: parseFloat(maxBudget) });
      }

      // Filter by experience level
      if (experienceLevel) {
        query += ' AND c.experienceLevel = @experienceLevel';
        parameters.push({ name: '@experienceLevel', value: experienceLevel });
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.freelanceJobs.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add pagination and sorting
      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({ query, parameters })
        .fetchAll();

      // Fetch client details for each job
      const clientIds = [...new Set(jobs.map((j: FreelanceJob) => j.clientId))];
      const clientsMap: Record<string, any> = {};

      if (clientIds.length > 0) {
        const clientsQuery = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified FROM c WHERE c.id IN (${clientIds.map((_, i) => `@id${i}`).join(',')})`;
        const clientsParams = clientIds.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: clients } = await containers.users.items
          .query({ query: clientsQuery, parameters: clientsParams })
          .fetchAll();

        clients.forEach((client: any) => {
          clientsMap[client.id] = client;
        });
      }

      // Combine jobs with client data (hide applicant details in list view)
      const jobsWithClients: FreelanceJobWithClient[] = jobs.map((job: FreelanceJob) => ({
        ...job,
        applicants: [], // Don't expose applicants in list view
        client: clientsMap[job.clientId] || null,
      }));

      const response: PaginatedResponse<FreelanceJobWithClient> = {
        success: true,
        data: jobsWithClients,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + jobs.length < total,
          hasPrev: page > 1,
        },
      };

      return { status: 200, jsonBody: response };
    } catch (error) {
      context.error('Error fetching freelance jobs:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch jobs' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/freelance-jobs/:id - Get job details
// ============================================================================
app.http('getFreelanceJobById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const userId = request.query.get('userId'); // Current user viewing

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: jobId }],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Fetch client details
      const { resource: client } = await containers.users.item(job.clientId, job.clientId).read<User>();

      // Check if current user is the client (owner)
      const isOwner = userId === job.clientId;

      // Check if current user has already applied
      const hasApplied = job.applicants.some(app => app.freelancerId === userId);
      const userApplication = job.applicants.find(app => app.freelancerId === userId);

      // Prepare response
      const jobResponse: any = {
        ...job,
        client: client ? {
          id: client.id,
          username: client.username,
          displayName: client.displayName,
          avatar: client.avatar,
          isVerified: client.isVerified,
        } : null,
        isOwner,
        hasApplied,
        userApplication: hasApplied ? userApplication : null,
      };

      // Only show applicants to job owner
      if (!isOwner) {
        jobResponse.applicants = [];
      }

      return {
        status: 200,
        jsonBody: { success: true, data: jobResponse } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/freelance-jobs - Create new freelance job
// ============================================================================
app.http('createFreelanceJob', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelance-jobs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as CreateFreelanceJobRequest & { clientId: string };

      // Validate required fields
      if (!body.title?.trim()) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Job title is required' } as ApiResponse,
        };
      }

      if (!body.description?.trim()) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Job description is required' } as ApiResponse,
        };
      }

      if (!body.clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      if (!body.budget?.amount || body.budget.amount <= 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Valid budget amount is required' } as ApiResponse,
        };
      }

      if (!body.duration?.value || body.duration.value <= 0) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Valid duration is required' } as ApiResponse,
        };
      }

      // Verify client exists
      const { resource: client } = await containers.users.item(body.clientId, body.clientId).read<User>();
      if (!client) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Client not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const newJob: FreelanceJob = {
        id: uuidv4(),
        clientId: body.clientId,
        title: body.title.trim(),
        description: body.description.trim(),
        skills: body.skills || [],
        experienceLevel: body.experienceLevel || 'intermediate',
        budget: {
          amount: body.budget.amount,
          currency: body.budget.currency || 'USD',
          type: body.budget.type || 'fixed',
        },
        duration: {
          value: body.duration.value,
          unit: body.duration.unit || 'weeks',
        },
        deadline: body.deadline,
        attachments: body.attachments || [],
        status: 'open',
        visibility: 'public',
        applicants: [],
        totalApplicants: 0,
        createdAt: now,
        updatedAt: now,
      };

      const { resource: createdJob } = await containers.freelanceJobs.items.create(newJob);

      // Return job with client info
      const jobWithClient = {
        ...createdJob,
        client: {
          id: client.id,
          username: client.username,
          displayName: client.displayName,
          avatar: client.avatar,
          isVerified: client.isVerified,
        },
      };

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: jobWithClient,
          message: 'Job posted successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error creating job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to create job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/freelance-jobs/:id - Update freelance job
// ============================================================================
app.http('updateFreelanceJob', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as Partial<CreateFreelanceJobRequest> & { clientId: string };

      if (!body.clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: body.clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found or you are not the owner' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Can only update open jobs
      if (job.status !== 'open') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Can only update jobs that are open for applications' } as ApiResponse,
        };
      }

      // Update fields
      const updatedJob: FreelanceJob = {
        ...job,
        title: body.title?.trim() ?? job.title,
        description: body.description?.trim() ?? job.description,
        skills: body.skills ?? job.skills,
        experienceLevel: body.experienceLevel ?? job.experienceLevel,
        budget: body.budget ?? job.budget,
        duration: body.duration ?? job.duration,
        deadline: body.deadline ?? job.deadline,
        attachments: body.attachments ?? job.attachments,
        updatedAt: new Date().toISOString(),
      };

      const { resource } = await containers.freelanceJobs.item(job.id, job.clientId).replace(updatedJob);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: resource,
          message: 'Job updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/freelance-jobs/:id - Delete/Cancel freelance job
// ============================================================================
app.http('deleteFreelanceJob', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const clientId = request.query.get('clientId');

      if (!clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found or you are not the owner' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // If job is in progress, mark as cancelled instead of deleting
      if (job.status === 'in_progress') {
        job.status = 'cancelled';
        job.updatedAt = new Date().toISOString();
        await containers.freelanceJobs.item(job.id, job.clientId).replace(job);

        return {
          status: 200,
          jsonBody: { success: true, message: 'Job cancelled successfully' } as ApiResponse,
        };
      }

      // Delete if still open
      await containers.freelanceJobs.item(jobId, clientId).delete();

      return {
        status: 200,
        jsonBody: { success: true, message: 'Job deleted successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error deleting job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to delete job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/freelance-jobs/:id/apply - Apply to a job
// ============================================================================
app.http('applyToFreelanceJob', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/apply',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as ApplyToJobRequest & { freelancerId: string };

      if (!body.freelancerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelancer ID is required' } as ApiResponse,
        };
      }

      if (!body.proposal?.trim()) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Proposal is required' } as ApiResponse,
        };
      }

      // Check if user is a freelancer
      const { resource: user } = await containers.users.item(body.freelancerId, body.freelancerId).read<User>();
      
      if (!user) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'User not found' } as ApiResponse,
        };
      }

      if (!user.isFreelancer) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You must enable freelancer mode to apply for jobs. Go to Settings to enable it.' } as ApiResponse,
        };
      }

      if (!user.freelancerProfile?.bankInfo?.accountNumber) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You must add bank information to your freelancer profile before applying for jobs.' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: jobId }],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Check if job is open
      if (job.status !== 'open') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'This job is no longer accepting applications' } as ApiResponse,
        };
      }

      // Check if user is the job owner
      if (job.clientId === body.freelancerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'You cannot apply to your own job' } as ApiResponse,
        };
      }

      // Check if already applied
      if (job.applicants.some(app => app.freelancerId === body.freelancerId)) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'You have already applied to this job' } as ApiResponse,
        };
      }

      // Create application
      const application: JobApplication = {
        id: uuidv4(),
        freelancerId: body.freelancerId,
        proposal: body.proposal.trim(),
        attachments: body.attachments,
        proposedBudget: body.proposedBudget,
        proposedDuration: body.proposedDuration,
        status: 'pending',
        appliedAt: new Date().toISOString(),
      };

      job.applicants.push(application);
      job.totalApplicants = job.applicants.length;
      job.updatedAt = new Date().toISOString();

      await containers.freelanceJobs.item(job.id, job.clientId).replace(job);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: application,
          message: 'Application submitted successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error applying to job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to submit application' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// DELETE /api/freelance-jobs/:id/apply - Withdraw application
// ============================================================================
app.http('withdrawApplication', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/apply',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const freelancerId = request.query.get('freelancerId');

      if (!freelancerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelancer ID is required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: jobId }],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Find the application
      const applicationIndex = job.applicants.findIndex(app => app.freelancerId === freelancerId);
      if (applicationIndex === -1) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Application not found' } as ApiResponse,
        };
      }

      const application = job.applicants[applicationIndex];

      // Can only withdraw pending applications
      if (application.status !== 'pending') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Cannot withdraw an application that has been processed' } as ApiResponse,
        };
      }

      // Remove application
      job.applicants.splice(applicationIndex, 1);
      job.totalApplicants = job.applicants.length;
      job.updatedAt = new Date().toISOString();

      await containers.freelanceJobs.item(job.id, job.clientId).replace(job);

      return {
        status: 200,
        jsonBody: { success: true, message: 'Application withdrawn successfully' } as ApiResponse,
      };
    } catch (error) {
      context.error('Error withdrawing application:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to withdraw application' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/freelance-jobs/:id/applicants - Get job applicants (owner only)
// ============================================================================
app.http('getJobApplicants', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/applicants',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const clientId = request.query.get('clientId');

      if (!clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      // Find the job (verify ownership)
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found or you are not the owner' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      // Fetch freelancer details for each applicant
      const freelancerIds = job.applicants.map(app => app.freelancerId);
      const freelancersMap: Record<string, any> = {};

      if (freelancerIds.length > 0) {
        const query = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified, c.freelancerProfile, c.skills FROM c WHERE c.id IN (${freelancerIds.map((_, i) => `@id${i}`).join(',')})`;
        const params = freelancerIds.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: freelancers } = await containers.users.items
          .query({ query, parameters: params })
          .fetchAll();

        freelancers.forEach((f: any) => {
          freelancersMap[f.id] = f;
        });
      }

      // Combine applications with freelancer data
      const applicationsWithFreelancers: ApplicationWithFreelancer[] = job.applicants.map(app => ({
        ...app,
        freelancer: {
          id: freelancersMap[app.freelancerId]?.id,
          username: freelancersMap[app.freelancerId]?.username,
          displayName: freelancersMap[app.freelancerId]?.displayName,
          avatar: freelancersMap[app.freelancerId]?.avatar,
          isVerified: freelancersMap[app.freelancerId]?.isVerified || false,
          skills: freelancersMap[app.freelancerId]?.skills || [],
          freelancerProfile: freelancersMap[app.freelancerId]?.freelancerProfile ? {
            title: freelancersMap[app.freelancerId].freelancerProfile.title,
            rating: freelancersMap[app.freelancerId].freelancerProfile.rating || 0,
            completedJobs: freelancersMap[app.freelancerId].freelancerProfile.completedJobs || 0,
            availability: freelancersMap[app.freelancerId].freelancerProfile.availability,
          } : undefined,
        },
      }));

      return {
        status: 200,
        jsonBody: { 
          success: true, 
          data: applicationsWithFreelancers,
          total: applicationsWithFreelancers.length,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching applicants:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch applicants' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/freelance-jobs/:id/hire - Hire a freelancer
// ============================================================================
app.http('hireFreelancer', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/hire',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as HireFreelancerRequest & { clientId: string };

      if (!body.clientId || !body.applicationId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID and Application ID are required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: body.clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found or you are not the owner' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      if (job.status !== 'open') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'This job is no longer open for hiring' } as ApiResponse,
        };
      }

      // Find the application
      const application = job.applicants.find(app => app.id === body.applicationId);
      if (!application) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Application not found' } as ApiResponse,
        };
      }

      // Get freelancer details
      const { resource: freelancer } = await containers.users.item(application.freelancerId, application.freelancerId).read<User>();

      if (!freelancer) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Freelancer not found' } as ApiResponse,
        };
      }

      if (!freelancer.freelancerProfile?.bankInfo) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelancer has not set up bank information' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Update job status
      job.status = 'in_progress';
      job.hiredFreelancer = {
        freelancerId: application.freelancerId,
        agreedBudget: body.agreedBudget || application.proposedBudget || job.budget.amount,
        agreedDeadline: body.agreedDeadline || job.deadline || '',
        hiredAt: now,
      };

      // Update application status
      application.status = 'accepted';
      
      // Reject other pending applications
      job.applicants.forEach(app => {
        if (app.id !== body.applicationId && app.status === 'pending') {
          app.status = 'rejected';
        }
      });

      job.updatedAt = now;

      // Create task for client
      const clientTask: Task = {
        id: uuidv4(),
        jobId: job.id,
        clientId: job.clientId,
        freelancerId: application.freelancerId,
        title: job.title,
        description: job.description,
        status: 'in_progress',
        budget: {
          amount: job.hiredFreelancer.agreedBudget,
          currency: job.budget.currency,
        },
        deadline: job.hiredFreelancer.agreedDeadline,
        isClientView: true,
        messagesCount: 0,
        lastActivity: now,
        createdAt: now,
        updatedAt: now,
      };

      // Create task for freelancer
      const freelancerTask: Task = {
        id: uuidv4(),
        jobId: job.id,
        clientId: job.clientId,
        freelancerId: application.freelancerId,
        title: job.title,
        description: job.description,
        status: 'in_progress',
        budget: {
          amount: job.hiredFreelancer.agreedBudget,
          currency: job.budget.currency,
        },
        deadline: job.hiredFreelancer.agreedDeadline,
        isFreelancerView: true,
        messagesCount: 0,
        lastActivity: now,
        createdAt: now,
        updatedAt: now,
      };

      // Update freelancer's availability
      if (freelancer.freelancerProfile) {
        freelancer.freelancerProfile.availability = 'busy';
        freelancer.updatedAt = now;
      }

      // Save everything
      await Promise.all([
        containers.freelanceJobs.item(job.id, job.clientId).replace(job),
        containers.tasks.items.create(clientTask),
        containers.tasks.items.create(freelancerTask),
        containers.users.item(freelancer.id, freelancer.id).replace(freelancer),
      ]);

      // Return freelancer's bank info to client (for direct payment)
      const bankInfo = freelancer.freelancerProfile.bankInfo;

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: {
            job: {
              ...job,
              applicants: [], // Don't return all applicants
            },
            hiredFreelancer: {
              id: freelancer.id,
              username: freelancer.username,
              displayName: freelancer.displayName,
              avatar: freelancer.avatar,
            },
            freelancerBankInfo: {
              bankName: bankInfo.bankName,
              accountNumber: bankInfo.accountNumber,
              accountHolderName: bankInfo.accountHolderName,
              ifscCode: bankInfo.ifscCode,
              swiftCode: bankInfo.swiftCode,
              routingNumber: bankInfo.routingNumber,
            },
            task: clientTask,
          },
          message: 'Freelancer hired successfully! Job is now closed for new applications. Bank details are provided for direct payment.',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error hiring freelancer:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to hire freelancer' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/freelance-jobs/:id/complete - Mark job as complete
// ============================================================================
app.http('completeFreelanceJob', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'freelance-jobs/{id}/complete',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const jobId = request.params.id;
      const body = (await request.json()) as { 
        clientId: string; 
        review?: { rating: number; comment: string } 
      };

      if (!body.clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      // Find the job
      const { resources: jobs } = await containers.freelanceJobs.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id AND c.clientId = @clientId',
          parameters: [
            { name: '@id', value: jobId },
            { name: '@clientId', value: body.clientId },
          ],
        })
        .fetchAll();

      if (jobs.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Job not found' } as ApiResponse,
        };
      }

      const job = jobs[0] as FreelanceJob;

      if (job.status !== 'in_progress') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Job is not in progress' } as ApiResponse,
        };
      }

      if (!job.hiredFreelancer) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'No freelancer hired for this job' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Update job
      job.status = 'completed';
      job.hiredFreelancer.completedAt = now;
      
      if (body.review) {
        // Validate review
        if (body.review.rating < 1 || body.review.rating > 5) {
          return {
            status: 400,
            jsonBody: { success: false, error: 'Rating must be between 1 and 5' } as ApiResponse,
          };
        }
        
        job.hiredFreelancer.clientReview = {
          rating: body.review.rating,
          comment: body.review.comment || '',
          createdAt: now,
        };
      }
      
      job.updatedAt = now;

      // Update tasks
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.jobId = @jobId',
          parameters: [{ name: '@jobId', value: jobId }],
        })
        .fetchAll();

      const updatePromises: Promise<any>[] = [
        containers.freelanceJobs.item(job.id, job.clientId).replace(job),
      ];

      // Update freelancer's stats
      const { resource: freelancer } = await containers.users
        .item(job.hiredFreelancer.freelancerId, job.hiredFreelancer.freelancerId)
        .read<User>();

      if (freelancer && freelancer.freelancerProfile) {
        const profile = freelancer.freelancerProfile;
        
        // Update completed jobs count
        profile.completedJobs = (profile.completedJobs || 0) + 1;
        
        // Update rating if review provided
        if (body.review) {
          const totalReviews = profile.totalReviews || 0;
          const currentRating = profile.rating || 0;
          
          // Calculate new average rating
          const newRating = totalReviews === 0 
            ? body.review.rating 
            : ((currentRating * totalReviews) + body.review.rating) / (totalReviews + 1);
          
          profile.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
          profile.totalReviews = totalReviews + 1;
        }
        
        // Set availability back to available
        profile.availability = 'available';
        freelancer.updatedAt = now;

        updatePromises.push(
          containers.users.item(freelancer.id, freelancer.id).replace(freelancer)
        );
      }

      // Update all related tasks to completed
      for (const task of tasks) {
        (task as Task).status = 'completed';
        (task as Task).updatedAt = now;
        updatePromises.push(
          containers.tasks.items.upsert(task)
        );
      }

      await Promise.all(updatePromises);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: { job },
          message: 'Job marked as complete. Thank you for using Dolphin Cove!',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error completing job:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to complete job' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/my-job-posts - Get user's posted jobs (as client)
// ============================================================================
app.http('getMyJobPosts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-job-posts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const clientId = request.query.get('clientId');
      const status = request.query.get('status'); // open, in_progress, completed, cancelled

      if (!clientId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Client ID is required' } as ApiResponse,
        };
      }

      let query = 'SELECT * FROM c WHERE c.clientId = @clientId';
      const parameters: { name: string; value: any }[] = [
        { name: '@clientId', value: clientId }
      ];

      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      query += ' ORDER BY c.createdAt DESC';

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({ query, parameters })
        .fetchAll();

      // Add summary info without exposing full applicant details
      const jobsWithSummary = jobs.map((job: FreelanceJob) => ({
        ...job,
        applicantCount: job.applicants.length,
        pendingApplications: job.applicants.filter(a => a.status === 'pending').length,
        applicants: [], // Don't expose full applicant list in this endpoint
      }));

      return {
        status: 200,
        jsonBody: { 
          success: true, 
          data: jobsWithSummary,
          total: jobs.length,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching job posts:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch job posts' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/my-applications - Get user's job applications (as freelancer)
// ============================================================================
app.http('getMyApplications', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-applications',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const freelancerId = request.query.get('freelancerId');
      const status = request.query.get('status'); // pending, accepted, rejected

      if (!freelancerId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Freelancer ID is required' } as ApiResponse,
        };
      }

      // Find all jobs where user has applied
      let query = 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.applicants, {"freelancerId": @freelancerId}, true)';
      const parameters: { name: string; value: any }[] = [
        { name: '@freelancerId', value: freelancerId }
      ];

      const { resources: jobs } = await containers.freelanceJobs.items
        .query({ query, parameters })
        .fetchAll();

      // Extract user's applications with job details
      const applications = jobs.map((job: FreelanceJob) => {
        const userApplication = job.applicants.find(a => a.freelancerId === freelancerId);
        return {
          application: userApplication,
          job: {
            id: job.id,
            title: job.title,
            budget: job.budget,
            duration: job.duration,
            status: job.status,
            clientId: job.clientId,
            createdAt: job.createdAt,
          },
        };
      }).filter(item => {
        if (status) {
          return item.application?.status === status;
        }
        return true;
      });

      // Fetch client details
      const clientIds = [...new Set(applications.map(a => a.job.clientId))];
      const clientsMap: Record<string, any> = {};

      if (clientIds.length > 0) {
        const clientsQuery = `SELECT c.id, c.username, c.displayName, c.avatar FROM c WHERE c.id IN (${clientIds.map((_, i) => `@id${i}`).join(',')})`;
        const clientsParams = clientIds.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: clients } = await containers.users.items
          .query({ query: clientsQuery, parameters: clientsParams })
          .fetchAll();

        clients.forEach((client: any) => {
          clientsMap[client.id] = client;
        });
      }

      // Add client info to applications
      const applicationsWithClients = applications.map(item => ({
        ...item,
        client: clientsMap[item.job.clientId] || null,
      }));

      return {
        status: 200,
        jsonBody: { 
          success: true, 
          data: applicationsWithClients,
          total: applicationsWithClients.length,
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching applications:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch applications' } as ApiResponse,
      };
    }
  },
});
