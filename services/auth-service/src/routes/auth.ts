import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  createApiResponse,
  ApiError,
} from "@marketplace/utils";
import { RegisterSchema, LoginSchema, Role } from "@marketplace/types";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/register", async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError("Email already registered", 400);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role as Role,
      },
    });

    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_SECRET!
    );

    const refreshToken = generateRefreshToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_REFRESH_SECRET!
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json(
      createApiResponse(true, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        refreshToken,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
      throw new ApiError("Invalid credentials", 401);
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);

    if (!isValid) {
      throw new ApiError("Invalid credentials", 401);
    }

    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_SECRET!
    );

    const refreshToken = generateRefreshToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_REFRESH_SECRET!
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json(
      createApiResponse(true, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        refreshToken,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { idToken, role = Role.USER } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new ApiError("Invalid Google token", 401);
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (user && user.role !== role) {
      throw new ApiError(
        `This email is already registered as ${user.role}. Cannot register as ${role}.`,
        400
      );
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || "User",
          googleId: payload.sub,
          avatar: payload.picture,
          role: role as Role,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, avatar: payload.picture },
      });
    }

    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_SECRET!
    );

    const refreshToken = generateRefreshToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_REFRESH_SECRET!
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json(
      createApiResponse(true, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError("Refresh token required", 400);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new ApiError("Invalid or expired refresh token", 401);
    }

    const payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);

    if (!payload) {
      throw new ApiError("Invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const newToken = generateToken(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_SECRET!
    );

    res.json(createApiResponse(true, { token: newToken }));
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.json(createApiResponse(true, user));
  } catch (error) {
    next(error);
  }
});

router.get("/user/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.json(createApiResponse(true, user));
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json(createApiResponse(true, null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
