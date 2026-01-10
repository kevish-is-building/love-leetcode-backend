import express from "express";
import { getProblemCount, getSubmissionCount, getUserCount } from "../controllers/utils.controller.js";

const utilsRoutes = express.Router();


utilsRoutes.get("/health-check", (req, res) => {
  res.status(200).json({ status: "OK", message: "Health check passed for utils" });
});

utilsRoutes.get("/user-count", getUserCount);
utilsRoutes.get("/problem-count", getProblemCount);
utilsRoutes.get("/submission-count", getSubmissionCount);

export default utilsRoutes;