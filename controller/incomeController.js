import Income from '../model/income.js';
import User from '../model/user.js';
import { Op } from 'sequelize';


export const createIncome = async (req, res) => {
  const { amount, source, description, date, userId } = req.body;
  if (!amount || !source || !date || !userId) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const income = await Income.create({ amount, source, description, date, userId });
    const user = await User.findByPk(userId);
    if (user) {
      user.totalBalance = (user.totalBalance || 0) + parseFloat(amount);
      await user.save();
    }
    res.status(201).json({income,user});
  } catch (err) {
    res.status(500).json({ message: 'Error creating income', error: err.message });
  }
};


export const getAllIncome = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    
    const totalCount = await Income.count({ where: { userId } });
    const totalPages = Math.ceil(totalCount / limit);

    
    const income = await Income.findAll({
      where: { userId },
      order: [['date', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      income,
      totalPages,
      currentPage: page
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching income', error: err.message });
  }
};



export const getIncomeByRange = async (req, res) => {
  const { userId } = req.params;
  const { range } = req.query; // range = 'daily' | 'weekly' | 'monthly' | 'yearly'

  const today = new Date();
  let startDate;

  switch (range) {
    case 'daily':
      startDate = new Date(today.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      const weekStart = today.getDate() - today.getDay();
      startDate = new Date(today.setDate(weekStart));
      break;
    case 'monthly':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'yearly':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      return res.status(400).json({ message: 'Invalid range query' });
  }

  try {
    const income = await Income.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startDate,
        },
      },
      order: [['date', 'DESC']],
    });

    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: 'Error filtering income', error: err.message });
  }
};

export const deleteIncome = async (req, res) => {
  const { id } = req.params;

  try {
    const income = await Income.findByPk(id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    const user = await User.findByPk(income.userId);
    if (user) {
      user.totalBalance = Math.max((user.totalBalance || 0) - income.amount, 0);
      await user.save();
    }

    await income.destroy();
    res.status(200).json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting income', error: err.message });
  }
};
