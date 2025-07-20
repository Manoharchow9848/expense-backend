import express from 'express';
import { db,sequelize } from './connectdb/db.js';
import cors from 'cors'
import dotenv from 'dotenv';
import sib from 'sib-api-v3-sdk';
dotenv.config();
const app = express();
import User from './model/user.js';
import Income from './model/income.js';
import { Payment } from './model/payment.js';
import  Expense  from './model/expense.js';
import userRoutes from './routes/user.route.js'
import expenseRoutes from './routes/expense.router.js'
import paymentroutes from './routes/payment.routes.js';
import incomeRoute from './routes/incomeRoute.js'
import reportRoutes from './routes/reportRoutes.js';
app.use(express.json())
app.use(cors())
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true,
}));

app.use('/api/users',userRoutes);
app.use('/api/expense',expenseRoutes)
app.use('/api/pay',paymentroutes)
app.use('/api/income', incomeRoute);
app.use('/api/report', reportRoutes);

sequelize.sync().then(()=>{
    app.listen(3000,()=>{
        db()
        console.log("App running on port 3000")
    })
}) 