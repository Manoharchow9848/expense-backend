import fs from 'fs';
import path from 'path';
import pdfkit from 'pdfkit';
import Income from '../model/income.js';
import Expense from '../model/expense.js';
import { Op } from 'sequelize';

const __dirname = path.resolve();

export const downloadReport = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.isPremium === false) {
      return res.status(403).json({ message: "Access denied. Premium users only." });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    const dailyIncome = await Income.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const dailyExpense = await Expense.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const monthlyIncome = await Income.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const monthlyExpense = await Expense.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const yearlyIncome = await Income.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
    });

    const yearlyExpense = await Expense.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
    });

    const totalYearlyIncome = yearlyIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalYearlyExpense = yearlyExpense.reduce((sum, item) => sum + item.price, 0);
    const balance = totalYearlyIncome - totalYearlyExpense;

    // Generate PDF
    const doc = new pdfkit();
    const reportPath = path.join(__dirname, 'reports', `report_${userId}.pdf`);
    const writeStream = fs.createWriteStream(reportPath);
    doc.pipe(writeStream);

    doc.fontSize(18).text('Expense & Income Report', { align: 'center' }).moveDown();
    doc.fontSize(14).text(`User ID: ${userId}`).moveDown();
    doc.text(`Date: ${new Date().toLocaleDateString()}`).moveDown();

    // Daily Report
    doc.fontSize(16).text('Daily Report');
    doc.fontSize(12).text(`Income: ₹${dailyIncome.reduce((sum, item) => sum + item.amount, 0)}`);
    doc.text(`Expense: ₹${dailyExpense.reduce((sum, item) => sum + item.price, 0)}`).moveDown();

    // Monthly Report with details
    doc.fontSize(16).text('Monthly Report').moveDown();

    doc.fontSize(14).text('Incomes:');
    monthlyIncome.forEach((income, index) => {
      doc.fontSize(12).text(`${index + 1}. Source: ${income.source} | Amount: ₹${income.amount}`);
    });
    const totalMonthlyIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0);
    doc.moveDown().fontSize(12).text(`Total Income: ₹${totalMonthlyIncome}`).moveDown();

    doc.fontSize(14).text('Expenses:');
    monthlyExpense.forEach((expense, index) => {
      doc.fontSize(12).text(`${index + 1}. Name: ${expense.name} | Price: ₹${expense.price} | Category: ${expense.category}`);
    });
    const totalMonthlyExpense = monthlyExpense.reduce((sum, item) => sum + item.price, 0);
    doc.moveDown().fontSize(12).text(`Total Expense: ₹${totalMonthlyExpense}`).moveDown();

    // Yearly Report
    doc.fontSize(16).text('Yearly Report');
    doc.fontSize(12).text(`Income: ₹${totalYearlyIncome}`);
    doc.text(`Expense: ₹${totalYearlyExpense}`);
    doc.text(`Balance: ₹${balance}`).moveDown();

    doc.end();

    writeStream.on('finish', () => {
      res.download(reportPath, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        fs.unlinkSync(reportPath);
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
