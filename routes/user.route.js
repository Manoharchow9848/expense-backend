import express from 'express';
import { createUser,login,getLeaderBoard,getUserById, sendPasswordReset, resetPassword } from '../controller/user.controller.js';
const router = express.Router();
import { verifyToken } from '../middleware/verifyToken.js';
import User from '../model/user.js';
router.post('/register',createUser)
router.post('/login',login)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // or `req.user._id` if using MongoDB
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

router.get("/leaderboard/:id",verifyToken, getLeaderBoard)
router.get('/:id', verifyToken, getUserById);
router.post('/reset-password-email', sendPasswordReset);
router.post('/reset-password', resetPassword);

export default router;