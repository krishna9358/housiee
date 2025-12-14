import { Router } from "express";
import prisma from "../lib/prisma";
import upload from "../lib/upload";
import {
  requireAuth,
  requireProvider,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

// List all services with filtering
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
          travelDetails: true,
          laundryDetails: true,
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

// Get single service by ID
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
        travelDetails: true,
        laundryDetails: true,
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

// Helper to parse comma-separated values
const parseCSV = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
};

// Create a new service
router.post(
  "/",
  requireAuth,
  requireProvider,
  upload.array("images", 5),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, category, basePrice, capacity, location, ...typeSpecificData } = req.body;
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
            capacity: parseInt(capacity) || 1,
            location: location || null,
            images,
          },
        });

        // Create category-specific details
        if (category === "ACCOMMODATION") {
          await tx.accommodationService.create({
            data: {
              serviceId: newService.id,
              propertyType: typeSpecificData.propertyType || "Apartment",
              bedrooms: parseInt(typeSpecificData.bedrooms) || 1,
              bathrooms: parseInt(typeSpecificData.bathrooms) || 1,
              maxGuests: parseInt(typeSpecificData.maxGuests) || 2,
              amenities: parseCSV(typeSpecificData.amenities),
              checkInTime: typeSpecificData.checkInTime || null,
              checkOutTime: typeSpecificData.checkOutTime || null,
            },
          });
        } else if (category === "FOOD") {
          await tx.foodService.create({
            data: {
              serviceId: newService.id,
              cuisineType: typeSpecificData.cuisineType || "Indian",
              mealTypes: parseCSV(typeSpecificData.mealTypes),
              dietaryOptions: parseCSV(typeSpecificData.dietaryOptions),
              servingSize: typeSpecificData.servingSize || null,
              deliveryAvailable: typeSpecificData.deliveryAvailable === "on" || typeSpecificData.deliveryAvailable === "true",
              preparationTime: typeSpecificData.preparationTime ? parseInt(typeSpecificData.preparationTime) : null,
            },
          });
        } else if (category === "TRAVEL") {
          await tx.travelService.create({
            data: {
              serviceId: newService.id,
              vehicleType: typeSpecificData.vehicleType || "Car",
              seatingCapacity: parseInt(typeSpecificData.seatingCapacity) || 4,
              acAvailable: typeSpecificData.acAvailable === "on" || typeSpecificData.acAvailable === "true",
              fuelIncluded: typeSpecificData.fuelIncluded === "on" || typeSpecificData.fuelIncluded === "true",
              driverIncluded: typeSpecificData.driverIncluded === "on" || typeSpecificData.driverIncluded === "true",
              pickupLocation: typeSpecificData.pickupLocation || null,
              dropLocation: typeSpecificData.dropLocation || null,
            },
          });
        } else if (category === "LAUNDRY") {
          await tx.laundryService.create({
            data: {
              serviceId: newService.id,
              serviceTypes: parseCSV(typeSpecificData.serviceTypes),
              pricePerKg: typeSpecificData.pricePerKg ? parseFloat(typeSpecificData.pricePerKg) : null,
              pricePerPiece: typeSpecificData.pricePerPiece ? parseFloat(typeSpecificData.pricePerPiece) : null,
              expressAvailable: typeSpecificData.expressAvailable === "on" || typeSpecificData.expressAvailable === "true",
              pickupAvailable: typeSpecificData.pickupAvailable === "on" || typeSpecificData.pickupAvailable === "true",
              deliveryAvailable: typeSpecificData.laundryDeliveryAvailable === "on" || typeSpecificData.laundryDeliveryAvailable === "true",
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

// Update a service
router.put(
  "/:id",
  requireAuth,
  requireProvider,
  upload.array("images", 5),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, description, basePrice, capacity, location, isActive, ...typeSpecificData } = req.body;
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
      if (capacity) updateData.capacity = parseInt(capacity);
      if (location !== undefined) updateData.location = location;
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

        // Update category-specific details based on service category
        if (service.category === "ACCOMMODATION" && Object.keys(typeSpecificData).length) {
          await tx.accommodationService.update({
            where: { serviceId: id },
            data: {
              ...(typeSpecificData.propertyType && { propertyType: typeSpecificData.propertyType }),
              ...(typeSpecificData.bedrooms && { bedrooms: parseInt(typeSpecificData.bedrooms) }),
              ...(typeSpecificData.bathrooms && { bathrooms: parseInt(typeSpecificData.bathrooms) }),
              ...(typeSpecificData.maxGuests && { maxGuests: parseInt(typeSpecificData.maxGuests) }),
              ...(typeSpecificData.amenities && { amenities: parseCSV(typeSpecificData.amenities) }),
              ...(typeSpecificData.checkInTime && { checkInTime: typeSpecificData.checkInTime }),
              ...(typeSpecificData.checkOutTime && { checkOutTime: typeSpecificData.checkOutTime }),
            },
          });
        } else if (service.category === "FOOD" && Object.keys(typeSpecificData).length) {
          await tx.foodService.update({
            where: { serviceId: id },
            data: {
              ...(typeSpecificData.cuisineType && { cuisineType: typeSpecificData.cuisineType }),
              ...(typeSpecificData.mealTypes && { mealTypes: parseCSV(typeSpecificData.mealTypes) }),
              ...(typeSpecificData.dietaryOptions && { dietaryOptions: parseCSV(typeSpecificData.dietaryOptions) }),
              ...(typeSpecificData.servingSize && { servingSize: typeSpecificData.servingSize }),
              ...(typeSpecificData.deliveryAvailable !== undefined && { deliveryAvailable: typeSpecificData.deliveryAvailable === "true" }),
            },
          });
        } else if (service.category === "TRAVEL" && Object.keys(typeSpecificData).length) {
          await tx.travelService.update({
            where: { serviceId: id },
            data: {
              ...(typeSpecificData.vehicleType && { vehicleType: typeSpecificData.vehicleType }),
              ...(typeSpecificData.seatingCapacity && { seatingCapacity: parseInt(typeSpecificData.seatingCapacity) }),
              ...(typeSpecificData.acAvailable !== undefined && { acAvailable: typeSpecificData.acAvailable === "true" }),
              ...(typeSpecificData.fuelIncluded !== undefined && { fuelIncluded: typeSpecificData.fuelIncluded === "true" }),
              ...(typeSpecificData.driverIncluded !== undefined && { driverIncluded: typeSpecificData.driverIncluded === "true" }),
              ...(typeSpecificData.pickupLocation && { pickupLocation: typeSpecificData.pickupLocation }),
              ...(typeSpecificData.dropLocation && { dropLocation: typeSpecificData.dropLocation }),
            },
          });
        } else if (service.category === "LAUNDRY" && Object.keys(typeSpecificData).length) {
          await tx.laundryService.update({
            where: { serviceId: id },
            data: {
              ...(typeSpecificData.serviceTypes && { serviceTypes: parseCSV(typeSpecificData.serviceTypes) }),
              ...(typeSpecificData.pricePerKg && { pricePerKg: parseFloat(typeSpecificData.pricePerKg) }),
              ...(typeSpecificData.pricePerPiece && { pricePerPiece: parseFloat(typeSpecificData.pricePerPiece) }),
              ...(typeSpecificData.expressAvailable !== undefined && { expressAvailable: typeSpecificData.expressAvailable === "true" }),
              ...(typeSpecificData.pickupAvailable !== undefined && { pickupAvailable: typeSpecificData.pickupAvailable === "true" }),
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

// Delete a service
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

// Get provider's own services
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
        provider: { select: { businessName: true, isVerified: true } },
        accommodationDetails: true,
        foodDetails: true,
        travelDetails: true,
        laundryDetails: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const servicesWithStats = services.map((service) => ({
      ...service,
      avgRating:
        service.reviews.length > 0
          ? service.reviews.reduce((acc, r) => acc + r.rating, 0) / service.reviews.length
          : null,
      reviewCount: service.reviews.length,
    }));

    res.json(servicesWithStats);
  } catch (error) {
    console.error("Error fetching provider services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

export default router;
