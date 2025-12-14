import { Router } from "express";
import prisma from "../lib/prisma";
import { requireAuth, requireAdmin, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = "1", limit = "20", role, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          serviceProvider: { select: { id: true, isVerified: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/providers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = "1", limit = "20", verified } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (verified !== undefined) where.isVerified = verified === "true";

    const [providers, total] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { services: true } },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    res.json({
      providers,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

router.patch("/providers/:id/verify", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const provider = await prisma.serviceProvider.findUnique({ where: { id } });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const updated = await prisma.serviceProvider.update({
      where: { id },
      data: { isVerified },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error verifying provider:", error);
    res.status(500).json({ error: "Failed to verify provider" });
  }
});

router.patch("/users/:id/role", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["USER", "SERVICE_PROVIDER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (id === req.user!.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json({ id: updated.id, role: updated.role });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

router.get("/statistics", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      verifiedProviders,
      totalServices,
      activeServices,
      totalBookings,
      revenueData,
      usersByRole,
      bookingsByStatus,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({ where: { isVerified: true } }),
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        _sum: { totalPrice: true },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          service: { select: { title: true } },
        },
      }),
    ]);

    res.json({
      overview: {
        totalUsers,
        totalProviders,
        verifiedProviders,
        totalServices,
        activeServices,
        totalBookings,
        totalRevenue: revenueData._sum.totalPrice || 0,
      },
      usersByRole: usersByRole.reduce(
        (acc, item) => ({ ...acc, [item.role]: item._count }),
        {}
      ),
      bookingsByStatus: bookingsByStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {}
      ),
      recentBookings,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
