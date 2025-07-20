import express from "express";
import { downloadReport } from "../controller/reportController.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();


router.get('/download',verifyToken, downloadReport);

export default router;
