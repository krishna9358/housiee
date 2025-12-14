import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/apply", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { businessName, description, phone, address, city } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: "Business name is required" });
    }

    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingProvider) {
      return res.status(400).json({ error: "You already have a provider profile" });
    }

    const provider = await prisma.serviceProvider.create({
      data: {
        userId: req.user!.id,
        businessName,
        description,
        phone,
        address,
        city,
        isVerified: false,
      },
    });

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: "SERVICE_PROVIDER" },
    });

    res.status(201).json(provider);
  } catch (error) {
    console.error("Error applying as provider:", error);
    res.status(500).json({ error: "Failed to apply as provider" });
  }
});

router.get("/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user!.id },
      include: {
        services: {
          select: { id: true, title: true, category: true, isActive: true },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    res.json(provider);
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { businessName, description, phone, address, city } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const updated = await prisma.serviceProvider.update({
      where: { userId: req.user!.id },
      data: {
        ...(businessName && { businessName }),
        ...(description !== undefined && { description }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating provider profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/dashboard-stats", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const [totalServices, activeServices, totalBookings, pendingBookings, totalRevenue] =
      await Promise.all([
        prisma.service.count({ where: { providerId: provider.id } }),
        prisma.service.count({ where: { providerId: provider.id, isActive: true } }),
        prisma.booking.count({
          where: { service: { providerId: provider.id } },
        }),
        prisma.booking.count({
          where: { service: { providerId: provider.id }, status: "PENDING" },
        }),
        prisma.booking.aggregate({
          where: {
            service: { providerId: provider.id },
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
          _sum: { totalPrice: true },
        }),
      ]);

    res.json({
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
