import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject
} from '../controllers/projectController.js';
import { getTasks, createTask } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, admin, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

router.route('/:id/members')
  .post(protect, admin, addMemberToProject);

router.route('/:id/members/:userId')
  .delete(protect, admin, removeMemberFromProject);

router.route('/:projectId/tasks')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

export default router;
