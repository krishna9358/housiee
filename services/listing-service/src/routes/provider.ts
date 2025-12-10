import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, ApiError } from "@marketplace/utils";
import { CreateListingSchema, Role } from "@marketplace/types";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);
router.use(requireRole(Role.PROVIDER));

router.get("/", async (req, res, next) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;

    const where: Record<string, unknown> = {
      providerId: req.user!.userId,
    };

    if (status) {
      where.status = status;
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

router.get("/stats", async (req, res, next) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.listing.count({ where: { providerId: req.user!.userId } }),
      prisma.listing.count({ where: { providerId: req.user!.userId, status: "PENDING" } }),
      prisma.listing.count({ where: { providerId: req.user!.userId, status: "APPROVED" } }),
      prisma.listing.count({ where: { providerId: req.user!.userId, status: "REJECTED" } }),
    ]);

    res.json(createApiResponse(true, { total, pending, approved, rejected }));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = CreateListingSchema.parse(req.body);

    const listing = await prisma.listing.create({
      data: {
        providerId: req.user!.userId,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.postalCode,
        country: data.address.country,
        latitude: data.latitude,
        longitude: data.longitude,
        price: data.price,
        priceUnit: data.priceUnit,
        images: data.images,
        amenities: data.amenities,
        availStart: data.availability?.startDate ? new Date(data.availability.startDate) : null,
        availEnd: data.availability?.endDate ? new Date(data.availability.endDate) : null,
        slots: data.availability?.slots,
        status: "PENDING",
      },
    });

    res.status(201).json(createApiResponse(true, listing, "Listing created and pending approval"));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw new ApiError("Listing not found", 404);
    }

    if (existing.providerId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    const data = CreateListingSchema.partial().parse(req.body);

    const updateData: Record<string, unknown> = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.type) updateData.type = data.type;
    if (data.address) {
      updateData.street = data.address.street;
      updateData.city = data.address.city;
      updateData.state = data.address.state;
      updateData.postalCode = data.address.postalCode;
      updateData.country = data.address.country;
    }
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.priceUnit) updateData.priceUnit = data.priceUnit;
    if (data.images) updateData.images = data.images;
    if (data.amenities) updateData.amenities = data.amenities;
    if (data.availability) {
      updateData.availStart = data.availability.startDate ? new Date(data.availability.startDate) : null;
      updateData.availEnd = data.availability.endDate ? new Date(data.availability.endDate) : null;
      updateData.slots = data.availability.slots;
    }

    if (existing.status === "REJECTED") {
      updateData.status = "PENDING";
    }

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(createApiResponse(true, listing));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw new ApiError("Listing not found", 404);
    }

    if (existing.providerId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    await prisma.listing.delete({
      where: { id: req.params.id },
    });

    res.json(createApiResponse(true, null, "Listing deleted"));
  } catch (error) {
    next(error);
  }
});

export { router as providerRouter };
