import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { executeCode, runCode } from "../controllers/executeCode.controller.js";

const executionRoutes = express.Router();

executionRoutes.get("/health-check", (req, res) => {
  res.status(200).json({ status: "OK", message: "Health check passed for execution" });
});

executionRoutes.post("/submit", authMiddleware, executeCode);
executionRoutes.post("/run",  runCode);

export default executionRoutes;
