import express from "express";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getAllSolvedProblemsByUser,
  getProblems,
} from "../controllers/problem.controller.js";

const problemRoutes = express.Router();

problemRoutes.get("/health-check", (req, res) => {
  res.status(200).json({ status: "OK", message: "Health check passed for problem" });
});

problemRoutes.post(
  "/create-problem",
  authMiddleware,
  checkAdmin,
  createProblem,
);

problemRoutes.get("/get-all-problems", authMiddleware, getAllProblems);

problemRoutes.get("/get-problem/:problemId", authMiddleware, getProblemById);

problemRoutes.put(
  "/update-problem/:problemId",
  authMiddleware,
  checkAdmin,
  updateProblem,
);

problemRoutes.delete(
  "/delete-problem/:problemId",
  authMiddleware,
  checkAdmin,
  deleteProblem,
);

problemRoutes.get(
  "/get-solved-problems",
  authMiddleware,
  getAllSolvedProblemsByUser,
);


problemRoutes.get("/get-problems", authMiddleware, getProblems);

export default problemRoutes;
