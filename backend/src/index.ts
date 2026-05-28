import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

// Environment variables are loaded via tsx --env-file

// Import routes
import authRoutes from "./routes/auth.routes";
import jobSeekerRoutes from "./routes/jobseeker.routes";
import interviewerRoutes from "./routes/interviewer.routes";
import sessionRoutes from "./routes/session.routes";
import paymentRoutes from "./routes/payment.routes";
import feedbackRoutes from "./routes/feedback.routes";
import adminRoutes from "./routes/admin.routes";
import questionsRoutes from "./routes/questions.routes";
import supportRoutes from "./routes/support.routes";
import reviewRoutes from "./routes/review.routes";
import videoRoutes from "./routes/video.routes";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";

import { initCronJobs } from "./cron";

const app: Express = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost",
  "http://127.0.0.1",
].filter(Boolean) as string[];

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and same-origin requests.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/interviewers", interviewerRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/videos", videoRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

import { pgClient } from "./config/database";

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  
  // Initialize cron jobs
  initCronJobs();
});

// Graceful shutdown to prevent zombie database connections during hot-reloading
const gracefulShutdown = async () => {
  console.log("Shutting down server and closing database connections...");
  try {
    await pgClient.end();
    console.log("Database connections closed.");
  } catch (err) {
    console.error("Error closing database connections", err);
  }
  server.close(() => {
    console.log("Server stopped.");
  });
  // Force exit immediately after closing DB to prevent tsx watch from hanging
  setTimeout(() => process.exit(0), 100);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Add global handlers to prevent server crashes due to uncaught errors (e.g. database statement timeouts)
process.on("uncaughtException", (error) => {
  console.error("CRITICAL: Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

export default app;
