import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, ApiError } from "@marketplace/utils";
import { Role } from "@marketplace/types";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

router.get("/pending", async (req, res, next) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "PENDING" },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "asc" },
      }),
      prisma.listing.count({ where: { status: "PENDING" } }),
    ]);

    res.json(
      createApiResponse(true, {
        items: listings,
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

router.get("/all", async (req, res, next) => {
  try {
    const { status, category, page = "1", limit = "10" } = req.query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (category) where.category = category;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json(
      createApiResponse(true, {
        items: listings,
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

router.get("/stats", async (_, res, next) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.listing.count({ where: { status: "APPROVED" } }),
      prisma.listing.count({ where: { status: "REJECTED" } }),
    ]);

    res.json(createApiResponse(true, { total, pending, approved, rejected }));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/approve", async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) {
      throw new ApiError("Listing not found", 404);
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" },
    });

    res.json(createApiResponse(true, updated, "Listing approved"));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/reject", async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) {
      throw new ApiError("Listing not found", 404);
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
    });

    res.json(createApiResponse(true, updated, "Listing rejected"));
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };
