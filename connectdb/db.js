import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    logging: false,
  }
);

export const db = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};
