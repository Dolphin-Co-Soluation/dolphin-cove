import { Router, Request, Response } from 'express';
import { supabase } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/tasks - Get all tasks for a user
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const jobId = req.query.jobId as string;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 50);
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' });

    if (userId) {
      query = query.or(`assignee_id.eq.${userId},creator_id.eq.${userId}`);
    }
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: tasks, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    // Get user details for assignees and creators
    const userIds = [...new Set([
      ...(tasks || []).map(t => t.assignee_id),
      ...(tasks || []).map(t => t.creator_id),
    ].filter(Boolean))];

    let usersMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, display_name, avatar')
        .in('id', userIds);

      if (users) {
        users.forEach(user => {
          usersMap[user.id] = user;
        });
      }
    }

    const formattedTasks = (tasks || []).map(task => ({
      id: task.id,
      jobId: task.job_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      creatorId: task.creator_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      assignee: usersMap[task.assignee_id] ? {
        id: usersMap[task.assignee_id].id,
        username: usersMap[task.assignee_id].username,
        displayName: usersMap[task.assignee_id].display_name,
        avatar: usersMap[task.assignee_id].avatar,
      } : null,
      creator: usersMap[task.creator_id] ? {
        id: usersMap[task.creator_id].id,
        username: usersMap[task.creator_id].username,
        displayName: usersMap[task.creator_id].display_name,
        avatar: usersMap[task.creator_id].avatar,
      } : null,
    }));

    res.json({
      success: true,
      data: formattedTasks,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// ============================================================================
// GET /api/tasks/:id - Get single task
// ============================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
});

// ============================================================================
// POST /api/tasks - Create new task
// ============================================================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const { jobId, title, description, assigneeId, creatorId, priority, dueDate } = req.body;

    if (!title || !creatorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'title and creatorId are required' 
      });
    }

    const taskId = uuidv4();
    const now = new Date().toISOString();

    const newTask = {
      id: taskId,
      job_id: jobId || null,
      title,
      description: description || '',
      status: 'pending',
      priority: priority || 'medium',
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
      creator_id: creatorId,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// ============================================================================
// PUT /api/tasks/:id - Update task
// ============================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update task' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// ============================================================================
// PATCH /api/tasks/:id/status - Update task status
// ============================================================================
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update task status' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, error: 'Failed to update task status' });
  }
});

// ============================================================================
// DELETE /api/tasks/:id - Delete task
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete task' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

export default router;
