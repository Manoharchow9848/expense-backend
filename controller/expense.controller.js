import User from '../model/user.js'
import Expense from '../model/expense.js'
import { sequelize } from '../connectdb/db.js';
export const createExpenseWithUserId = async (req, res) => {
    const { name, price, category, userId } = req.body;
    if (!name || !price || !category || !userId) {
        res.status(400).json({ message: "All fields Required" })

    }
    const transaction = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();

            res.status(401).json({ message: `No Users found with ${user}` })
        }
        const newExpense = await Expense.create({ name, price, category, userId }, { transaction });
        
        user.totalExpenses += Number(price); // FIXED HERE
        await user.save({ transaction });
        await transaction.commit();
        res.status(200).json({ message: "Expense Created Successfully" });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        
        res.status(500).json({ message: "Internal Server error" })
    }
}
export const getAllExpensesWithUserId = async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const totalCount = await Expense.count({ where: { userId } });
    const totalPages = Math.ceil(totalCount / limit);

    const expenses = await Expense.findAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ expenses, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


export const getAllIncomeWithUserId = async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const totalCount = await Income.count({ where: { userId } });
    const totalPages = Math.ceil(totalCount / limit);

    const income = await Income.findAll({
      where: { userId },
      limit,
      offset,
      order: [['date', 'DESC']],
    });

    res.status(200).json({ income, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching income', error: err.message });
  }
};
export const deleteExpense = async (req, res) => {
  const id = req.params.id;

  const t = await sequelize.transaction();

  try {
    const expense = await Expense.findByPk(id, { transaction: t });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findByPk(expense.userId, { transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found for this expense" });
    }

    user.totalExpenses -= Number(expense.price);
    if (user.totalExpenses < 0) user.totalExpenses = 0; // optional: prevent negative totals

    await user.save({ transaction: t });
    await expense.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: "Expense Deleted and Total Updated Successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};