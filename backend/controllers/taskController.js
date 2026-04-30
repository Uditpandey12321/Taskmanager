import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedUser', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/projects/:projectId/tasks
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedUser } = req.body;

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      project: req.params.projectId,
      assignedUser: assignedUser || null,
    });

    const createdTask = await task.save();

    if (assignedUser) {
      const project = await Project.findById(req.params.projectId);
      if (project && !project.members.includes(assignedUser) && project.admin.toString() !== assignedUser) {
        project.members.push(assignedUser);
        await project.save();
      }
    }

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task (Admin can update all, Members can only update status of assigned tasks)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      // Check permissions
      if (req.user.role !== 'Admin') {
        if (task.assignedUser?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to update this task' });
        }
        // Members can only update status
        task.status = req.body.status || task.status;
      } else {
        // Admin can update anything
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;
        task.assignedUser = req.body.assignedUser || task.assignedUser;
      }

      const updatedTask = await task.save();

      if (req.body.assignedUser) {
        const project = await Project.findById(task.project);
        if (project && !project.members.includes(req.body.assignedUser) && project.admin.toString() !== req.body.assignedUser) {
          project.members.push(req.body.assignedUser);
          await project.save();
        }
      }

      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my tasks across all projects
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedUser: req.user._id }).populate('project', 'title');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
