import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getAllUserSubmissions,
  getAllSubmissionsForProblem,
  getUserSubmissionsForProblem,
} from "../controllers/submission.controller.js";

const submissionRoutes = express.Router();

submissionRoutes.get("/health-check", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Health check passed for submission" });
});

submissionRoutes.get(
  "/get-submissions/:problemId",
  authMiddleware,
  getUserSubmissionsForProblem,
);
submissionRoutes.get(
  "/get-all-submissions",
  authMiddleware,
  getAllUserSubmissions,
);
submissionRoutes.get(
  "/get-submission-count/:problemId",
  authMiddleware,
  getAllSubmissionsForProblem,
);

export default submissionRoutes;
