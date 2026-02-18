import jwt from "jsonwebtoken";

export interface JWTPayload {
  id: number;
  email: string;
  userType: "job_seeker" | "interviewer" | "admin";
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here_min_32_characters";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): JWTPayload | null => {
  return jwt.decode(token) as JWTPayload | null;
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
};
