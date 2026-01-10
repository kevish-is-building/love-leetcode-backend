import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { ApiResponse } from "./utils/api-response.js";
import { db } from "./libs/db.js";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoutes from "./routes/executionCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import utilsRoutes from "./routes/utils.routes.js";

dotenv.config({
  path: "./.env",
});

const port = Number(process.env.PORT) || 3000;
const app = express();
// app.use(cors({
//     // origin: process.env.FRONTEND_URL,
//     origin: "*",
//     credentials: true
// }))

const corsOptions = {
  origin: "http://localhost:3000", // replace with your frontend origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json(new ApiResponse(200, "Sever is running"));
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execution-code", executionRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/admin", adminRoutes);

// Utils apis
app.use("/api/v1/utils", utilsRoutes);

app.listen(port, "0.0.0.0", () => {
  {
    console.log(`Server is running on port: ${port}`);
  }
});
