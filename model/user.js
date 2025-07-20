import { DataTypes } from "sequelize";
import { sequelize } from "../connectdb/db.js";

const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  totalExpenses: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  totalBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  resetToken: {
    type: DataTypes.STRING,
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
  },
});

export default User;
