import express from 'express';
import {
  updateTask,
  deleteTask,
  getMyTasks
} from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/my-tasks').get(protect, getMyTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

export default router;
