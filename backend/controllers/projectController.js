import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Get all projects (Admin sees all, Members see assigned)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({}).populate('admin', 'name email').populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('admin', 'name email').populate('members', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('admin', 'name email').populate('members', 'name email');

    if (project) {
      // Check if user has access
      if (req.user.role !== 'Admin' && !project.members.some(member => member._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const { title, description, deadline, members } = req.body;

    const project = new Project({
      title,
      description,
      deadline,
      admin: req.user._id,
      members: members || [],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (project) {
      project.title = title || project.title;
      project.description = description || project.description;
      project.deadline = deadline || project.deadline;
      project.status = status || project.status;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
export const addMemberToProject = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.members.includes(userId)) {
        return res.status(400).json({ message: 'User is already a member' });
      }
      project.members.push(userId);
      await project.save();
      res.json({ message: 'Member added to project' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
export const removeMemberFromProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      project.members = project.members.filter(member => member.toString() !== req.params.userId);
      await project.save();
      res.json({ message: 'Member removed from project' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
