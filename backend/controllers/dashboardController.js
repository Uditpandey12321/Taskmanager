import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const matchUserProjects = req.user.role === 'Admin' ? {} : { members: req.user._id };
    const projects = await Project.find(matchUserProjects);
    const projectIds = projects.map(p => p._id);

    const matchUserTasks = req.user.role === 'Admin' ? { project: { $in: projectIds } } : { assignedUser: req.user._id };
    
    const totalTasks = await Task.countDocuments(matchUserTasks);
    
    // Status counts
    const todoTasks = await Task.countDocuments({ ...matchUserTasks, status: 'To Do' });
    const inProgressTasks = await Task.countDocuments({ ...matchUserTasks, status: 'In Progress' });
    const doneTasks = await Task.countDocuments({ ...matchUserTasks, status: 'Done' });

    // Pending/Completed for legacy/backward compatibility in UI
    const completedTasks = doneTasks;
    const pendingTasks = todoTasks + inProgressTasks;
    
    // Overdue tasks
    const today = new Date();
    const overdueTasks = await Task.countDocuments({ ...matchUserTasks, status: { $ne: 'Done' }, dueDate: { $lt: today } });

    // Tasks per user
    const tasksPerUserAgg = await Task.aggregate([
      { $match: matchUserTasks },
      { $group: { _id: "$assignedUser", count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ["$user.name", "Unassigned"] }, count: 1, _id: 1 } }
    ]);

    res.json({
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus: {
        'To Do': todoTasks,
        'In Progress': inProgressTasks,
        'Done': doneTasks
      },
      tasksPerUser: tasksPerUserAgg.map(t => ({ name: t.name, count: t.count })),
      projectCompletionPercentage: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
