import bcrypt from "bcryptjs";
import User from "../model/user.js";
import Expense from "../model/expense.js";
import { Op, Sequelize } from "sequelize";
import sendResetEmail from "../brevo/sendResetEmail.js";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Or any duration
  });
};
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Email and password are required" });
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must atleast length of 6" });
  }
  try {
    const existing = await User.findOne({
      where: { email },
    });
    if (existing) {
      res.status(400).json({ message: "Email already exists" });
    }
    let hashedPassword = bcrypt.hashSync(password, 10);
    let newuser = await User.create({ name, email, password: hashedPassword });

    res.status(200).json({ message: "User Registered Successfully" });
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      res.status(404).json({ message: "User not Found" });
    }
    let compare = await bcrypt.compare(password, user.password);

    if (!compare) {
      res.status(401).json({ message: "Invalid Credintials" });
    }
    const token = generateToken(user.id);
    const { password: pwd, ...safeUser } = user.toJSON();
    res.status(200).json({safeUser , token });
  } catch (error) {
    res.status(500).json({ message: `Internal server error ${error}` });
  }
};

export const getLeaderBoard = async (req, res) => {
  const id = req.params.id;
  try {
    let user = await User.findByPk(id);

    if (!user) { 
      return res.json("No users found");
    } else if (!user.isPremium) {
      return res.json("You are not a premium user");
    }

    const result = await User.findAll({
      attributes: ["id", "name", "totalExpenses","email"],
      order: [["totalExpenses", "DESC"]],
    });

    return res.json(result);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user.toJSON(); // Exclude password from response
    res.status(200).json(safeUser);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendPasswordReset = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } }); 
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 1000 * 60 * 60;
  user.resetToken = token;
  user.resetTokenExpiry = new Date(expiry);
  await user.save();

  try {
    await sendResetEmail({
      email: user.email,
      name: user.name,
      token,
    });

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

export const resetPassword = async (req, res) => {
 
  const { newPassword,token } = req.body;

 try {
     const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiry: { [Op.gt]: new Date() }
    }
  });

  if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword; 
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
 } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
 }
};

