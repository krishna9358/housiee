import { Router } from "express";
import prisma from "../lib/prisma";
import upload from "../lib/upload";
import {
  requireAuth,
  requireProvider,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "10" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          provider: { select: { businessName: true, isVerified: true } },
          reviews: { select: { rating: true } },
          accommodationDetails: true,
          foodDetails: true,
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    const servicesWithRating = services.map((service) => ({
      ...service,
      avgRating:
        service.reviews.length > 0
          ? service.reviews.reduce((acc, r) => acc + r.rating, 0) /
            service.reviews.length
          : null,
      reviewCount: service.reviews.length,
    }));

    res.json({
      services: servicesWithRating,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, businessName: true, isVerified: true, description: true },
        },
        accommodationDetails: true,
        foodDetails: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const avgRating =
      service.reviews.length > 0
        ? service.reviews.reduce((acc, r) => acc + r.rating, 0) /
          service.reviews.length
        : null;

    res.json({ ...service, avgRating, reviewCount: service.reviews.length });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

router.post(
  "/",
  requireAuth,
  requireProvider,
  upload.array("images", 5),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, category, basePrice, ...typeSpecificData } = req.body;
      const files = req.files as Express.Multer.File[];

      const provider = await prisma.serviceProvider.findUnique({
        where: { userId: req.user!.id },
      });

      if (!provider) {
        return res.status(400).json({ error: "You must be a registered provider" });
      }

      const images = files?.map((f) => `/uploads/${f.filename}`) || [];

      const service = await prisma.$transaction(async (tx) => {
        const newService = await tx.service.create({
          data: {
            providerId: provider.id,
            title,
            description,
            category,
            basePrice: parseFloat(basePrice),
            images,
          },
        });

        if (category === "ACCOMMODATION") {
          await tx.accommodationService.create({
            data: {
              serviceId: newService.id,
              propertyType: typeSpecificData.propertyType,
              bedrooms: parseInt(typeSpecificData.bedrooms),
              bathrooms: parseInt(typeSpecificData.bathrooms),
              maxGuests: parseInt(typeSpecificData.maxGuests),
              amenities: typeSpecificData.amenities
                ? JSON.parse(typeSpecificData.amenities)
                : [],
              checkInTime: typeSpecificData.checkInTime,
              checkOutTime: typeSpecificData.checkOutTime,
            },
          });
        } else if (category === "FOOD") {
          await tx.foodService.create({
            data: {
              serviceId: newService.id,
              cuisineType: typeSpecificData.cuisineType,
              mealTypes: typeSpecificData.mealTypes
                ? JSON.parse(typeSpecificData.mealTypes)
                : [],
              dietaryOptions: typeSpecificData.dietaryOptions
                ? JSON.parse(typeSpecificData.dietaryOptions)
                : [],
              servingSize: typeSpecificData.servingSize,
              deliveryAvailable: typeSpecificData.deliveryAvailable === "true",
            },
          });
        }

        return newService;
      });

      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  }
);

router.put(
  "/:id",
  requireAuth,
  requireProvider,
  upload.array("images", 5),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, description, basePrice, isActive, ...typeSpecificData } = req.body;
      const files = req.files as Express.Multer.File[];

      const service = await prisma.service.findUnique({
        where: { id },
        include: { provider: true },
      });

      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }

      if (service.provider.userId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ error: "Not authorized to update this service" });
      }

      const updateData: Record<string, unknown> = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (basePrice) updateData.basePrice = parseFloat(basePrice);
      if (isActive !== undefined) updateData.isActive = isActive === "true";
      if (files?.length) {
        updateData.images = [
          ...service.images,
          ...files.map((f) => `/uploads/${f.filename}`),
        ];
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedService = await tx.service.update({
          where: { id },
          data: updateData,
        });

        if (service.category === "ACCOMMODATION" && Object.keys(typeSpecificData).length) {
          await tx.accommodationService.update({
            where: { serviceId: id },
            data: {
              ...(typeSpecificData.propertyType && { propertyType: typeSpecificData.propertyType }),
              ...(typeSpecificData.bedrooms && { bedrooms: parseInt(typeSpecificData.bedrooms) }),
              ...(typeSpecificData.bathrooms && { bathrooms: parseInt(typeSpecificData.bathrooms) }),
              ...(typeSpecificData.maxGuests && { maxGuests: parseInt(typeSpecificData.maxGuests) }),
              ...(typeSpecificData.amenities && { amenities: JSON.parse(typeSpecificData.amenities) }),
              ...(typeSpecificData.checkInTime && { checkInTime: typeSpecificData.checkInTime }),
              ...(typeSpecificData.checkOutTime && { checkOutTime: typeSpecificData.checkOutTime }),
            },
          });
        } else if (service.category === "FOOD" && Object.keys(typeSpecificData).length) {
          await tx.foodService.update({
            where: { serviceId: id },
            data: {
              ...(typeSpecificData.cuisineType && { cuisineType: typeSpecificData.cuisineType }),
              ...(typeSpecificData.mealTypes && { mealTypes: JSON.parse(typeSpecificData.mealTypes) }),
              ...(typeSpecificData.dietaryOptions && { dietaryOptions: JSON.parse(typeSpecificData.dietaryOptions) }),
              ...(typeSpecificData.servingSize && { servingSize: typeSpecificData.servingSize }),
              ...(typeSpecificData.deliveryAvailable !== undefined && { deliveryAvailable: typeSpecificData.deliveryAvailable === "true" }),
            },
          });
        }

        return updatedService;
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  }
);

router.delete("/:id", requireAuth, requireProvider, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (service.provider.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this service" });
    }

    await prisma.service.delete({ where: { id } });
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

router.get("/provider/my-services", requireAuth, requireProvider, async (req: AuthenticatedRequest, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(400).json({ error: "Provider profile not found" });
    }

    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
      include: {
        accommodationDetails: true,
        foodDetails: true,
        reviews: { select: { rating: true } },
        bookings: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (error) {
    console.error("Error fetching provider services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

export default router;
