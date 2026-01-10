import express from "express";
import { getAllUsers, getAllProblems, getAllPlaylists, getAllSubmissions,} from "../controllers/admin.controller.js";
import { authMiddleware, checkAdmin } from "../middlewares/auth.middleware.js";

const adminRoutes = express.Router();

adminRoutes.get("/health-check", (req, res) => {
  res.status(200).json({ status: "OK", message: "Health check passed for admin" });
});

adminRoutes.get("/get-all-users", authMiddleware, checkAdmin, getAllUsers);
adminRoutes.get("/get-all-problems", authMiddleware, checkAdmin, getAllProblems);
adminRoutes.get("/get-all-playlists", authMiddleware, checkAdmin, getAllPlaylists);
adminRoutes.get("/get-all-submissions", authMiddleware, checkAdmin, getAllSubmissions);

export default adminRoutes;