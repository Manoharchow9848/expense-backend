import express from 'express';
import { createExpenseWithUserId ,getAllExpensesWithUserId,deleteExpense} from '../controller/expense.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/create',verifyToken, createExpenseWithUserId);
router.get('/:id',verifyToken, getAllExpensesWithUserId);

router.delete('/:id',verifyToken, deleteExpense);

export default router;