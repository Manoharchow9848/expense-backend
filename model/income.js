import { DataTypes } from 'sequelize';
import { sequelize } from '../connectdb/db.js';
import User from './user.js';

const Income = sequelize.define('Income', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

Income.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Income, { foreignKey: 'userId' });

export default Income;
