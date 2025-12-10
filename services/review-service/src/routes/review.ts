import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, ApiError } from "@marketplace/utils";
import { CreateReviewSchema, Role } from "@marketplace/types";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

async function checkCompletedBooking(userId: string, listingId: string, token: string) {
  const res = await fetch(
    `${process.env.BOOKING_SERVICE_URL}/bookings/listing/${listingId}/completed`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.data?.hasCompleted || false;
}

router.get("/listing/:listingId", async (req, res, next) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId: req.params.listingId },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { listingId: req.params.listingId } }),
    ]);

    res.json(
      createApiResponse(true, {
        items: reviews,
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

router.get("/listing/:listingId/rating", async (req, res, next) => {
  try {
    const result = await prisma.review.aggregate({
      where: { listingId: req.params.listingId },
      _avg: { rating: true },
      _count: true,
    });

    res.json(
      createApiResponse(true, {
        avgRating: result._avg.rating || 0,
        reviewCount: result._count,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireRole(Role.USER), async (req, res, next) => {
  try {
    const data = CreateReviewSchema.parse(req.body);
    const token = req.headers.authorization?.split(" ")[1] || "";

    const hasCompleted = await checkCompletedBooking(req.user!.userId, data.listingId, token);

    if (!hasCompleted) {
      throw new ApiError("You can only review listings you have completed bookings for", 400);
    }

    const existing = await prisma.review.findUnique({
      where: {
        userId_listingId: {
          userId: req.user!.userId,
          listingId: data.listingId,
        },
      },
    });

    if (existing) {
      throw new ApiError("You have already reviewed this listing", 400);
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        listingId: data.listingId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    res.status(201).json(createApiResponse(true, review, "Review submitted"));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, requireRole(Role.USER), async (req, res, next) => {
  try {
    const existing = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw new ApiError("Review not found", 404);
    }

    if (existing.userId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    const data = CreateReviewSchema.partial().parse(req.body);

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        ...(data.rating && { rating: data.rating }),
        ...(data.comment && { comment: data.comment }),
      },
    });

    res.json(createApiResponse(true, review, "Review updated"));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, requireRole(Role.USER), async (req, res, next) => {
  try {
    const existing = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw new ApiError("Review not found", 404);
    }

    if (existing.userId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    res.json(createApiResponse(true, null, "Review deleted"));
  } catch (error) {
    next(error);
  }
});

export { router as reviewRouter };
