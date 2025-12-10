import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@marketplace/types";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string,
  expiresIn: string = "7d"
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string
): string {
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

export function formatPrice(price: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function calculateTotalPrice(
  pricePerUnit: number,
  quantity: number,
  days?: number
): number {
  if (days && days > 0) {
    return pricePerUnit * days * quantity;
  }
  return pricePerUnit * quantity;
}

export function getDateDiff(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
) {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(error && { error }),
  };
}
