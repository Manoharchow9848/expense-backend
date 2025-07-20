import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config(); 

const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;

export const sequelize = new Sequelize(database, username, password, {
  host, 
  dialect: "mysql",
});

export const db = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};
