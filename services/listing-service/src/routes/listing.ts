import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, ApiError } from "@marketplace/utils";
import { ListingCategory } from "@marketplace/types";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res, next) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10",
      search,
    } = req.query;

    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (category) {
      where.category = category as ListingCategory;
    }

    if (city) {
      where.city = { contains: city as string, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice as string);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

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

router.get("/featured", async (_, res, next) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
      take: 8,
    });

    res.json(createApiResponse(true, listings));
  } catch (error) {
    next(error);
  }
});

router.get("/categories", async (_, res, next) => {
  try {
    const categories = await prisma.listing.groupBy({
      by: ["category"],
      where: { status: "APPROVED" },
      _count: true,
    });

    res.json(createApiResponse(true, categories));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) {
      throw new ApiError("Listing not found", 404);
    }

    res.json(createApiResponse(true, listing));
  } catch (error) {
    next(error);
  }
});

export { router as listingRouter };
