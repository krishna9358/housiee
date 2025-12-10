import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, ApiError } from "@marketplace/utils";
import { Role } from "@marketplace/types";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);
router.use(requireRole(Role.PROVIDER));

router.get("/", async (req, res, next) => {
  try {
    const { status, listingId, page = "1", limit = "10" } = req.query;

    const where: Record<string, unknown> = {
      providerId: req.user!.userId,
    };

    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json(
      createApiResponse(true, {
        items: bookings,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      })
    );
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.booking.count({ where: { providerId: req.user!.userId } }),
      prisma.booking.count({ where: { providerId: req.user!.userId, status: "PENDING" } }),
      prisma.booking.count({ where: { providerId: req.user!.userId, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { providerId: req.user!.userId, status: "COMPLETED" } }),
      prisma.booking.count({ where: { providerId: req.user!.userId, status: "CANCELLED" } }),
    ]);

    res.json(createApiResponse(true, { total, pending, confirmed, completed, cancelled }));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/confirm", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }

    if (booking.providerId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    if (booking.status !== "PENDING") {
      throw new ApiError("Can only confirm pending bookings", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CONFIRMED" },
    });

    res.json(createApiResponse(true, updated, "Booking confirmed"));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/complete", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }

    if (booking.providerId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    if (booking.status !== "CONFIRMED") {
      throw new ApiError("Can only complete confirmed bookings", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "COMPLETED" },
    });

    res.json(createApiResponse(true, updated, "Booking completed"));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }

    if (booking.providerId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      throw new ApiError("Cannot cancel this booking", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });

    res.json(createApiResponse(true, updated, "Booking cancelled"));
  } catch (error) {
    next(error);
  }
});

export { router as providerRouter };
