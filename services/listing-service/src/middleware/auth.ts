import { Request, Response, NextFunction } from "express";
import { verifyToken, ApiError } from "@marketplace/utils";
import { JwtPayload, Role } from "@marketplace/types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token, process.env.JWT_SECRET!);

    if (!payload) {
      throw new ApiError("Invalid or expired token", 401);
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError("Insufficient permissions", 403));
    }

    next();
  };
}
