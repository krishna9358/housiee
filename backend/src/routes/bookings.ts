import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, requireProvider, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Create a new booking with capacity checking
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { serviceId, startDate, endDate, quantity = 1, notes } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (!service.isActive) {
      return res.status(400).json({ error: "Service is not available" });
    }

    // Check capacity
    const availableSeats = service.capacity - service.bookedCount;
    if (quantity > availableSeats) {
      return res.status(400).json({ 
        error: `Only ${availableSeats} seat(s) available. Please reduce your quantity.` 
      });
    }

    // Calculate total price
    let totalPrice = service.basePrice * quantity;
    if (service.category === "ACCOMMODATION" && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      totalPrice = service.basePrice * nights;
    }

    // Create booking and update bookedCount in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check capacity within transaction (optimistic locking)
      const currentService = await tx.service.findUnique({
        where: { id: serviceId },
      });

      if (!currentService || currentService.bookedCount + quantity > currentService.capacity) {
        throw new Error("Insufficient capacity");
      }

      // Update service bookedCount
      await tx.service.update({
        where: { id: serviceId },
        data: { bookedCount: { increment: quantity } },
      });

      // Create booking
      return tx.booking.create({
        data: {
          userId: req.user!.id,
          serviceId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          quantity,
          totalPrice,
          notes,
        },
        include: {
          service: { select: { title: true, category: true } },
        },
      });
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof Error && error.message === "Insufficient capacity") {
      return res.status(400).json({ error: "Not enough seats available" });
    }
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Get user's bookings
router.get("/my-bookings", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { userId: req.user!.id };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            images: true,
            provider: { select: { businessName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get provider's bookings
router.get("/provider-bookings", requireAuth, requireProvider, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.query;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(400).json({ error: "Provider profile not found" });
    }

    const where: Record<string, unknown> = {
      service: { providerId: provider.id },
    };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: { select: { id: true, title: true, category: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Update booking status
router.patch("/:id/status", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: { include: { provider: true } } },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isProvider = booking.service.provider.userId === req.user!.id;
    const isBookingUser = booking.userId === req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";

    if (!isProvider && !isBookingUser && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Users can only cancel their own bookings
    if (isBookingUser && !isProvider && !isAdmin) {
      if (status !== "CANCELLED") {
        return res.status(403).json({ error: "Users can only cancel bookings" });
      }
    }

    // Handle capacity when cancelling
    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status },
      });

      // If booking is cancelled, release the capacity
      if (status === "CANCELLED" && booking.status !== "CANCELLED") {
        await tx.service.update({
          where: { id: booking.serviceId },
          data: { bookedCount: { decrement: booking.quantity } },
        });
      }

      return updatedBooking;
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// Get booking by ID
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            provider: { select: { businessName: true, phone: true } },
            accommodationDetails: true,
            foodDetails: true,
            travelDetails: true,
            laundryDetails: true,
          },
        },
        user: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isOwner = booking.userId === req.user!.id;
    const isProvider = booking.service.provider;
    const isAdmin = req.user!.role === "ADMIN";

    if (!isOwner && !isProvider && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

export default router;
