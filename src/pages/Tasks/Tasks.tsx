import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { taskService, type Task } from '../../services/taskService';
import './Tasks.css';

type RoleFilter = 'all' | 'client' | 'freelancer';
type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stats, setStats] = useState<{
    asClient: { total: number; pending: number; inProgress: number; completed: number };
    asFreelancer: { total: number; pending: number; inProgress: number; completed: number };
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchStats();
    }
  }, [user?.id, roleFilter, statusFilter]);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await taskService.getTasks(user.id, {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setTasks(response.data || []);
    } catch (error: any) {
      showError(error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const response = await taskService.getTaskStats(user.id);
      setStats(response.data);
    } catch (error) {
      // Stats are optional, don't show error
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgress = (task: Task) => {
    if (!task.milestones || task.milestones.length === 0) {
      if (task.status === 'completed') return 100;
      if (task.status === 'in_progress') return 50;
      return 0;
    }

    const completed = task.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / task.milestones.length) * 100);
  };

  const totalStats = stats
    ? {
        pending: stats.asClient.pending + stats.asFreelancer.pending,
        inProgress: stats.asClient.inProgress + stats.asFreelancer.inProgress,
        completed: stats.asClient.completed + stats.asFreelancer.completed,
      }
    : { pending: 0, inProgress: 0, completed: 0 };

  if (!user) {
    return (
      <div className="tasks-page">
        <div className="empty-tasks">
          <div className="icon">🔒</div>
          <h3>Please log in</h3>
          <p>You need to be logged in to view your tasks</p>
          <button className="browse-jobs-btn" onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>📋 My Tasks</h1>
      </div>

      {/* Stats Cards */}
      <div className="task-stats">
        <div className="stat-card pending">
          <div className="icon">⏳</div>
          <div className="value">{totalStats.pending}</div>
          <div className="label">Pending</div>
        </div>
        <div className="stat-card progress">
          <div className="icon">🔄</div>
          <div className="value">{totalStats.inProgress}</div>
          <div className="label">In Progress</div>
        </div>
        <div className="stat-card completed">
          <div className="icon">✅</div>
          <div className="value">{totalStats.completed}</div>
          <div className="label">Completed</div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="tasks-tabs">
        <button
          className={`task-tab ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => setRoleFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`task-tab ${roleFilter === 'client' ? 'active' : ''}`}
          onClick={() => setRoleFilter('client')}
        >
          📤 Tasks I've Given
        </button>
        <button
          className={`task-tab ${roleFilter === 'freelancer' ? 'active' : ''}`}
          onClick={() => setRoleFilter('freelancer')}
        >
          📥 Tasks I've Accepted
        </button>
      </div>

      {/* Status Filters */}
      <div className="tasks-filters">
        <button
          className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setStatusFilter('in_progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-tasks">
          <div className="icon">📭</div>
          <h3>No tasks found</h3>
          <p>
            {roleFilter === 'freelancer'
              ? "You haven't been hired for any jobs yet"
              : roleFilter === 'client'
              ? "You haven't hired anyone yet"
              : 'Start by posting a job or applying to jobs'}
          </p>
          <button className="browse-jobs-btn" onClick={() => navigate('/freelance')}>
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card" onClick={() => navigate(`/tasks/${task.id}`)}>
              <div className="task-card-header">
                <h3 className="task-title">{task.jobTitle}</h3>
                <span className={`task-status ${task.status}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="task-meta">
                <div className="task-meta-item">
                  <span className="icon">💰</span>
                  <span className="task-budget">{formatBudget(task.budget)}</span>
                </div>
                <div className="task-meta-item">
                  <span className="icon">📅</span>
                  <span>Started: {formatDate(task.startDate)}</span>
                </div>
                <div className="task-meta-item">
                  <span className="icon">⏰</span>
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
                {task.milestones && task.milestones.length > 0 && (
                  <div className="task-meta-item">
                    <span className="icon">🎯</span>
                    <span>
                      {task.milestones.filter((m) => m.status === 'completed').length}/
                      {task.milestones.length} Milestones
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="task-progress">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{getProgress(task)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${getProgress(task)}%` }} />
                </div>
              </div>

              <div className="task-people">
                <div className="task-person">
                  <div className="person-avatar">{task.clientName?.charAt(0)}</div>
                  <div className="person-info">
                    <span className="label">Client: </span>
                    <span className="name">{task.clientName}</span>
                  </div>
                </div>
                <div className="task-person">
                  <div className="person-avatar">{task.freelancerName?.charAt(0)}</div>
                  <div className="person-info">
                    <span className="label">Freelancer: </span>
                    <span className="name">{task.freelancerName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
