import express from 'express';
import {processPayment,getPaymentDetailById} from '../controller/payment.controller.js'
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();


router.post("/", verifyToken, processPayment)
router.get("/:id",getPaymentDetailById)





export default router;