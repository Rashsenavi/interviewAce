import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../config/jwt";
import { db } from "../config/database";
import { interviewers } from "../db/schema";
import { eq } from "drizzle-orm";

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verify JWT token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // If no Authorization header, check cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_TOKEN",
          message: "No authentication token provided",
        },
      });
    }

    const payload = verifyToken(token);
    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message:
          error instanceof Error ? error.message : "Invalid authentication token",
      },
    });
  }
};

/**
 * Authorization middleware - check user role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "User not authenticated",
        },
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "User does not have permission to access this resource",
        },
      });
    }

    next();
  };
};

/**
 * Check if interviewer is verified
 */
export const checkVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "User not authenticated",
        },
      });
    }

    // Allow non-interviewer roles to continue.
    if (req.user.userType !== "interviewer") {
      return next();
    }

    const [interviewer] = await db
      .select({
        isVerified: interviewers.isVerified,
        verificationStatus: interviewers.verificationStatus,
      })
      .from(interviewers)
      .where(eq(interviewers.userId, req.user.id))
      .limit(1);

    if (!interviewer) {
      return res.status(404).json({
        success: false,
        error: {
          code: "INTERVIEWER_PROFILE_NOT_FOUND",
          message: "Interviewer profile not found",
        },
      });
    }

    if (!interviewer.isVerified || interviewer.verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        error: {
          code: "INTERVIEWER_NOT_VERIFIED",
          message: "Your interviewer profile is pending admin approval",
        },
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "VERIFICATION_CHECK_ERROR",
        message: "Error checking verification status",
      },
    });
  }
};

export default {
  authenticate,
  authorize,
  checkVerified,
};
