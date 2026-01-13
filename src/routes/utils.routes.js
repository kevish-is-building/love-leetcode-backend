import express from "express";
import {
  getProblemCount,
  getUserSubmissionCount,
  getUserCount,
  getUserTotalSolvedProblemsCount,
  getUserProgress,
} from "../controllers/utils.controller.js";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";

const utilsRoutes = express.Router();

utilsRoutes.get("/health-check", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Health check passed for utils" });
});

utilsRoutes.get("/user-count",checkAdmin, getUserCount);
utilsRoutes.get("/problem-count", getProblemCount);
utilsRoutes.get("/user/submission-count",authMiddleware, getUserSubmissionCount);
utilsRoutes.get("/user/solved-problems-count",authMiddleware, getUserTotalSolvedProblemsCount);
utilsRoutes.get("/user/progress",authMiddleware, getUserProgress);
export default utilsRoutes;
