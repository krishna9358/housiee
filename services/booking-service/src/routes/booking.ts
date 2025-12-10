import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createApiResponse, ApiError, calculateTotalPrice, getDateDiff } from "@marketplace/utils";
import { CreateBookingSchema, Role } from "@marketplace/types";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

async function fetchListing(listingId: string) {
  const res = await fetch(`${process.env.LISTING_SERVICE_URL}/listings/${listingId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

router.use(requireAuth);
router.use(requireRole(Role.USER));

router.get("/me", async (req, res, next) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;

    const where: Record<string, unknown> = {
      userId: req.user!.userId,
    };

    if (status) where.status = status;

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

router.get("/:id", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }

    if (booking.userId !== req.user!.userId) {
      throw new ApiError("Not authorized", 403);
    }

    res.json(createApiResponse(true, booking));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = CreateBookingSchema.parse(req.body);

    const listing = await fetchListing(data.listingId);

    if (!listing) {
      throw new ApiError("Listing not found", 404);
    }

    if (listing.status !== "APPROVED") {
      throw new ApiError("This listing is not available for booking", 400);
    }

    let days = 1;
    if (data.startDate && data.endDate) {
      days = getDateDiff(new Date(data.startDate), new Date(data.endDate));
    }

    const totalPrice = calculateTotalPrice(listing.price, data.quantity, days);

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.userId,
        listingId: data.listingId,
        providerId: listing.providerId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        quantity: data.quantity,
        totalPrice,
        notes: data.notes,
        status: "PENDING",
      },
    });

    res.status(201).json(createApiResponse(true, booking, "Booking created successfully"));
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

    if (booking.userId !== req.user!.userId) {
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

router.get("/listing/:listingId/completed", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        userId: req.user!.userId,
        listingId: req.params.listingId,
        status: "COMPLETED",
      },
    });

    res.json(createApiResponse(true, { hasCompleted: !!booking }));
  } catch (error) {
    next(error);
  }
});

export { router as bookingRouter };
