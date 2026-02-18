import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Import routes
import authRoutes from "./routes/auth.routes";
import jobSeekerRoutes from "./routes/jobseeker.routes";
import interviewerRoutes from "./routes/interviewer.routes";
import sessionRoutes from "./routes/session.routes";
import paymentRoutes from "./routes/payment.routes";
import feedbackRoutes from "./routes/feedback.routes";
import adminRoutes from "./routes/admin.routes";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
