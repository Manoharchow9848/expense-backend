// models/Expense.js
import { DataTypes } from "sequelize";
import { sequelize } from "../connectdb/db.js";
import User from "./user.js";

 const Expense = sequelize.define("Expense", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM("food", "skin", "electronics"),
    allowNull: false
  }
});

// Relationship Mapping
User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "userId" });

export default Expense;