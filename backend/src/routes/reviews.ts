import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const hasBooked = await prisma.booking.findFirst({
      where: {
        userId: req.user!.id,
        serviceId,
        status: "COMPLETED",
      },
    });

    if (!hasBooked) {
      return res.status(400).json({ error: "You can only review services you have booked" });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_serviceId: {
          userId: req.user!.id,
          serviceId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this service" });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        serviceId,
        rating,
        comment,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.get("/service/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { serviceId },
        include: { user: { select: { name: true, image: true } } },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { serviceId } }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
