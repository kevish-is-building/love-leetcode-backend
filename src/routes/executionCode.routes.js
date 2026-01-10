import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { executeCode } from "../controllers/executeCode.controller.js";

const executionRoutes = express.Router();

executionRoutes.get("/health-check", (req, res) => {
  res.status(200).json({ status: "OK", message: "Health check passed for execution" });
});

executionRoutes.post("/", authMiddleware, executeCode);

export default executionRoutes;
