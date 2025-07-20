import express from 'express';
import {
  createIncome,
  getAllIncome,
  getIncomeByRange,deleteIncome
} from '../controller/incomeController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/', verifyToken, createIncome); 
router.get('/:userId',verifyToken, getAllIncome); 
router.get('/range/:userId', verifyToken, getIncomeByRange); 
router.delete('/:id', verifyToken, deleteIncome);
export default router;
