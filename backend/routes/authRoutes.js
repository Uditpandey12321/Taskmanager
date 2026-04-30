import express from 'express';
import { registerUser, loginUser, getUserProfile, getAllUsers, deleteUser, verifyUser, adminCreateUser } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.route('/users')
  .get(protect, admin, getAllUsers)
  .post(protect, admin, adminCreateUser);
router.route('/users/:id')
  .delete(protect, admin, deleteUser);
router.route('/users/:id/verify')
  .put(protect, admin, verifyUser);

export default router;
