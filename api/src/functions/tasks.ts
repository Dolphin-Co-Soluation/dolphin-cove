import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { containers } from '../lib/database';
import { Task, User, ApiResponse, PaginatedResponse } from '../types';

// ============================================================================
// GET /api/tasks - Get user's tasks (as client or freelancer)
// ============================================================================
app.http('getTasks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tasks',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.query.get('userId');
      const role = request.query.get('role'); // 'client' | 'freelancer' | undefined (both)
      const status = request.query.get('status'); // 'in_progress' | 'completed' | 'cancelled'
      const page = parseInt(request.query.get('page') || '1');
      const pageSize = Math.min(parseInt(request.query.get('pageSize') || '20'), 50);
      const offset = (page - 1) * pageSize;

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Build query based on role
      let query = 'SELECT * FROM c WHERE ';
      const parameters: { name: string; value: any }[] = [];

      if (role === 'client') {
        query += 'c.clientId = @userId AND c.isClientView = true';
        parameters.push({ name: '@userId', value: userId });
      } else if (role === 'freelancer') {
        query += 'c.freelancerId = @userId AND c.isFreelancerView = true';
        parameters.push({ name: '@userId', value: userId });
      } else {
        // Get all tasks where user is either client or freelancer
        query += '((c.clientId = @userId AND c.isClientView = true) OR (c.freelancerId = @userId AND c.isFreelancerView = true))';
        parameters.push({ name: '@userId', value: userId });
      }

      // Filter by status
      if (status) {
        query += ' AND c.status = @status';
        parameters.push({ name: '@status', value: status });
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
      const { resources: countResult } = await containers.tasks.items
        .query({ query: countQuery, parameters })
        .fetchAll();
      const total = countResult[0] || 0;

      // Add sorting and pagination
      query += ' ORDER BY c.lastActivity DESC OFFSET @offset LIMIT @limit';
      parameters.push({ name: '@offset', value: offset });
      parameters.push({ name: '@limit', value: pageSize });

      const { resources: tasks } = await containers.tasks.items
        .query({ query, parameters })
        .fetchAll();

      // Fetch related user info (client and freelancer details)
      const userIds = new Set<string>();
      tasks.forEach((task: Task) => {
        userIds.add(task.clientId);
        userIds.add(task.freelancerId);
      });

      const userIdsArray = Array.from(userIds);
      const usersMap: Record<string, any> = {};

      if (userIdsArray.length > 0) {
        const usersQuery = `SELECT c.id, c.username, c.displayName, c.avatar, c.isVerified FROM c WHERE c.id IN (${userIdsArray.map((_, i) => `@id${i}`).join(',')})`;
        const usersParams = userIdsArray.map((id, i) => ({ name: `@id${i}`, value: id }));

        const { resources: users } = await containers.users.items
          .query({ query: usersQuery, parameters: usersParams })
          .fetchAll();

        users.forEach((user: any) => {
          usersMap[user.id] = user;
        });
      }

      // Enhance tasks with user info
      const tasksWithUsers = tasks.map((task: Task) => ({
        ...task,
        client: usersMap[task.clientId] || null,
        freelancer: usersMap[task.freelancerId] || null,
        isUserClient: task.clientId === userId,
        isUserFreelancer: task.freelancerId === userId,
      }));

      const response: PaginatedResponse<any> = {
        success: true,
        data: tasksWithUsers,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: offset + tasks.length < total,
          hasPrev: page > 1,
        },
      };

      return { status: 200, jsonBody: response };
    } catch (error) {
      context.error('Error fetching tasks:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch tasks' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/tasks/:id - Get task details
// ============================================================================
app.http('getTaskById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tasks/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const taskId = request.params.id;
      const userId = request.query.get('userId');

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the task
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: taskId }],
        })
        .fetchAll();

      if (tasks.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Task not found' } as ApiResponse,
        };
      }

      const task = tasks[0] as Task;

      // Verify user is part of this task
      if (task.clientId !== userId && task.freelancerId !== userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You do not have access to this task' } as ApiResponse,
        };
      }

      // Fetch client and freelancer details
      const [clientResult, freelancerResult] = await Promise.all([
        containers.users.item(task.clientId, task.clientId).read<User>(),
        containers.users.item(task.freelancerId, task.freelancerId).read<User>(),
      ]);

      const client = clientResult.resource;
      const freelancer = freelancerResult.resource;

      // Prepare bank info only if user is client and task is in progress/completed
      let freelancerBankInfo: {
        bankName: string;
        accountNumber: string;
        accountHolderName: string;
        ifscCode?: string;
        swiftCode?: string;
        routingNumber?: string;
      } | null = null;
      
      if (task.clientId === userId && freelancer?.freelancerProfile?.bankInfo) {
        const bankInfo = freelancer.freelancerProfile.bankInfo;
        freelancerBankInfo = {
          bankName: bankInfo.bankName,
          accountNumber: bankInfo.accountNumber,
          accountHolderName: bankInfo.accountHolderName,
          ifscCode: bankInfo.ifscCode,
          swiftCode: bankInfo.swiftCode,
          routingNumber: bankInfo.routingNumber,
        };
      }

      const taskWithDetails = {
        ...task,
        client: client ? {
          id: client.id,
          username: client.username,
          displayName: client.displayName,
          avatar: client.avatar,
          isVerified: client.isVerified,
        } : null,
        freelancer: freelancer ? {
          id: freelancer.id,
          username: freelancer.username,
          displayName: freelancer.displayName,
          avatar: freelancer.avatar,
          isVerified: freelancer.isVerified,
          freelancerProfile: freelancer.freelancerProfile ? {
            title: freelancer.freelancerProfile.title,
            rating: freelancer.freelancerProfile.rating,
            completedJobs: freelancer.freelancerProfile.completedJobs,
          } : null,
        } : null,
        freelancerBankInfo, // Only for client view
        isUserClient: task.clientId === userId,
        isUserFreelancer: task.freelancerId === userId,
      };

      return {
        status: 200,
        jsonBody: { success: true, data: taskWithDetails } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching task:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch task' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/tasks/:id - Update task (milestones, status)
// ============================================================================
app.http('updateTask', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  route: 'tasks/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const taskId = request.params.id;
      const body = (await request.json()) as {
        userId: string;
        milestones?: Task['milestones'];
        status?: Task['status'];
      };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the task
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: taskId }],
        })
        .fetchAll();

      if (tasks.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Task not found' } as ApiResponse,
        };
      }

      const task = tasks[0] as Task;

      // Verify user is part of this task
      if (task.clientId !== body.userId && task.freelancerId !== body.userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You do not have access to this task' } as ApiResponse,
        };
      }

      // Can only update tasks that are in progress
      if (task.status !== 'in_progress') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Can only update tasks that are in progress' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();

      // Update milestones if provided
      if (body.milestones) {
        task.milestones = body.milestones;
      }

      // Update status if provided (only client can mark as disputed/completed)
      if (body.status && task.clientId === body.userId) {
        if (['completed', 'disputed', 'cancelled'].includes(body.status)) {
          task.status = body.status;
        }
      }

      // Freelancer can only mark milestone as completed
      // Status completion should be done via the job complete endpoint

      task.lastActivity = now;
      task.updatedAt = now;

      // Update this task
      await containers.tasks.items.upsert(task);

      // Also update the corresponding task for the other party
      const { resources: relatedTasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.jobId = @jobId AND c.id != @taskId',
          parameters: [
            { name: '@jobId', value: task.jobId },
            { name: '@taskId', value: taskId },
          ],
        })
        .fetchAll();

      for (const relatedTask of relatedTasks) {
        (relatedTask as Task).milestones = task.milestones;
        (relatedTask as Task).status = task.status;
        (relatedTask as Task).lastActivity = now;
        (relatedTask as Task).updatedAt = now;
        await containers.tasks.items.upsert(relatedTask);
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: task,
          message: 'Task updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating task:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update task' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// POST /api/tasks/:id/milestones - Add milestone to task
// ============================================================================
app.http('addTaskMilestone', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'tasks/{id}/milestones',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const taskId = request.params.id;
      const body = (await request.json()) as {
        userId: string;
        milestone: {
          title: string;
          description?: string;
          dueDate: string;
        };
      };

      if (!body.userId || !body.milestone?.title) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID and milestone title are required' } as ApiResponse,
        };
      }

      // Find the task
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: taskId }],
        })
        .fetchAll();

      if (tasks.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Task not found' } as ApiResponse,
        };
      }

      const task = tasks[0] as Task;

      // Verify user is part of this task
      if (task.clientId !== body.userId && task.freelancerId !== body.userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You do not have access to this task' } as ApiResponse,
        };
      }

      if (task.status !== 'in_progress') {
        return {
          status: 400,
          jsonBody: { success: false, error: 'Can only add milestones to in-progress tasks' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const { v4: uuidv4 } = require('uuid');

      const newMilestone = {
        id: uuidv4(),
        title: body.milestone.title.trim(),
        description: body.milestone.description?.trim(),
        dueDate: body.milestone.dueDate,
        status: 'pending' as const,
      };

      if (!task.milestones) {
        task.milestones = [];
      }

      task.milestones.push(newMilestone);
      task.lastActivity = now;
      task.updatedAt = now;

      await containers.tasks.items.upsert(task);

      // Update related task
      const { resources: relatedTasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.jobId = @jobId AND c.id != @taskId',
          parameters: [
            { name: '@jobId', value: task.jobId },
            { name: '@taskId', value: taskId },
          ],
        })
        .fetchAll();

      for (const relatedTask of relatedTasks) {
        (relatedTask as Task).milestones = task.milestones;
        (relatedTask as Task).lastActivity = now;
        (relatedTask as Task).updatedAt = now;
        await containers.tasks.items.upsert(relatedTask);
      }

      return {
        status: 201,
        jsonBody: {
          success: true,
          data: newMilestone,
          message: 'Milestone added successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error adding milestone:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to add milestone' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// PUT /api/tasks/:id/milestones/:milestoneId - Update milestone status
// ============================================================================
app.http('updateTaskMilestone', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'tasks/{id}/milestones/{milestoneId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const taskId = request.params.id;
      const milestoneId = request.params.milestoneId;
      const body = (await request.json()) as {
        userId: string;
        status?: 'pending' | 'in_progress' | 'completed';
        title?: string;
        description?: string;
        dueDate?: string;
      };

      if (!body.userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Find the task
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: taskId }],
        })
        .fetchAll();

      if (tasks.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Task not found' } as ApiResponse,
        };
      }

      const task = tasks[0] as Task;

      // Verify user is part of this task
      if (task.clientId !== body.userId && task.freelancerId !== body.userId) {
        return {
          status: 403,
          jsonBody: { success: false, error: 'You do not have access to this task' } as ApiResponse,
        };
      }

      if (!task.milestones || task.milestones.length === 0) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'No milestones found' } as ApiResponse,
        };
      }

      const milestoneIndex = task.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) {
        return {
          status: 404,
          jsonBody: { success: false, error: 'Milestone not found' } as ApiResponse,
        };
      }

      const now = new Date().toISOString();
      const milestone = task.milestones[milestoneIndex];

      // Update milestone fields
      if (body.status) {
        milestone.status = body.status;
        if (body.status === 'completed') {
          milestone.completedAt = now;
        }
      }
      if (body.title) milestone.title = body.title.trim();
      if (body.description !== undefined) milestone.description = body.description?.trim();
      if (body.dueDate) milestone.dueDate = body.dueDate;

      task.milestones[milestoneIndex] = milestone;
      task.lastActivity = now;
      task.updatedAt = now;

      await containers.tasks.items.upsert(task);

      // Update related task
      const { resources: relatedTasks } = await containers.tasks.items
        .query({
          query: 'SELECT * FROM c WHERE c.jobId = @jobId AND c.id != @taskId',
          parameters: [
            { name: '@jobId', value: task.jobId },
            { name: '@taskId', value: taskId },
          ],
        })
        .fetchAll();

      for (const relatedTask of relatedTasks) {
        (relatedTask as Task).milestones = task.milestones;
        (relatedTask as Task).lastActivity = now;
        (relatedTask as Task).updatedAt = now;
        await containers.tasks.items.upsert(relatedTask);
      }

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: milestone,
          message: 'Milestone updated successfully',
        } as ApiResponse,
      };
    } catch (error) {
      context.error('Error updating milestone:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to update milestone' } as ApiResponse,
      };
    }
  },
});

// ============================================================================
// GET /api/tasks/stats - Get task statistics
// ============================================================================
app.http('getTaskStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tasks/stats',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = request.query.get('userId');

      if (!userId) {
        return {
          status: 400,
          jsonBody: { success: false, error: 'User ID is required' } as ApiResponse,
        };
      }

      // Get all tasks for the user
      const { resources: tasks } = await containers.tasks.items
        .query({
          query: 'SELECT c.status, c.clientId, c.freelancerId, c.budget FROM c WHERE c.clientId = @userId OR c.freelancerId = @userId',
          parameters: [{ name: '@userId', value: userId }],
        })
        .fetchAll();

      // Calculate stats
      const stats = {
        asClient: {
          total: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          totalSpent: 0,
        },
        asFreelancer: {
          total: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          totalEarned: 0,
        },
      };

      const seenJobIds = new Set<string>();

      tasks.forEach((task: any) => {
        // Avoid counting duplicate tasks for same job
        const key = `${task.jobId}-${task.isClientView ? 'client' : 'freelancer'}`;
        if (seenJobIds.has(key)) return;
        seenJobIds.add(key);

        if (task.clientId === userId && task.isClientView) {
          stats.asClient.total++;
          if (task.status === 'in_progress') stats.asClient.inProgress++;
          else if (task.status === 'completed') {
            stats.asClient.completed++;
            stats.asClient.totalSpent += task.budget?.amount || 0;
          }
          else if (task.status === 'cancelled') stats.asClient.cancelled++;
        }

        if (task.freelancerId === userId && task.isFreelancerView) {
          stats.asFreelancer.total++;
          if (task.status === 'in_progress') stats.asFreelancer.inProgress++;
          else if (task.status === 'completed') {
            stats.asFreelancer.completed++;
            stats.asFreelancer.totalEarned += task.budget?.amount || 0;
          }
          else if (task.status === 'cancelled') stats.asFreelancer.cancelled++;
        }
      });

      return {
        status: 200,
        jsonBody: { success: true, data: stats } as ApiResponse,
      };
    } catch (error) {
      context.error('Error fetching task stats:', error);
      return {
        status: 500,
        jsonBody: { success: false, error: 'Failed to fetch task stats' } as ApiResponse,
      };
    }
  },
});
