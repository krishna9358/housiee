"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Plane,
  Utensils,
  Home,
  Shirt,
  CheckCircle,
  Users,
  ArrowRight,
} from "lucide-react";
import type { Service } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const categoryConfig = {
  TRAVEL: { icon: Plane, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  FOOD: { icon: Utensils, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
  ACCOMMODATION: { icon: Home, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  LAUNDRY: { icon: Shirt, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

interface ServiceCardProps {
  service: Service;
  variant?: "default" | "compact" | "featured";
}

export function ServiceCard({ service, variant = "default" }: ServiceCardProps) {
  const imageUrl = service.images[0]
    ? service.images[0].startsWith("http")
      ? service.images[0]
      : `${API_URL}${service.images[0]}`
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

  const categoryInfo = categoryConfig[service.category] || categoryConfig.ACCOMMODATION;
  const CategoryIcon = categoryInfo.icon;
  const availableSeats = service.capacity - service.bookedCount;
  const isLowAvailability = availableSeats > 0 && availableSeats <= 5;

  const priceUnit = {
    TRAVEL: "",
    FOOD: "/meal",
    ACCOMMODATION: "/night",
    LAUNDRY: "/kg",
  }[service.category] || "";

  if (variant === "compact") {
    return (
      <Link href={`/services/${service.id}`}>
        <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 h-full flex">
          <div className="relative w-24 sm:w-32 shrink-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <CardContent className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", categoryInfo.bg, categoryInfo.color)}>
                  <CategoryIcon className="h-2.5 w-2.5 mr-0.5" />
                  {service.category}
                </Badge>
                {service.provider.isVerified && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </div>
              <h3 className="font-medium text-sm line-clamp-1">
                {service.title}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-sm">{formatCurrency(service.basePrice)}</span>
              {service.avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{service.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/services/${service.id}`}>
        <Card className="group overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 card-hover h-full">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={cn("gap-1 text-xs", categoryInfo.bg, categoryInfo.color)}>
                <CategoryIcon className="h-3 w-3" />
                {service.category}
              </Badge>
            </div>

            {/* Availability Badge */}
            {availableSeats <= 0 ? (
              <div className="absolute top-3 right-3">
                <Badge variant="destructive" className="text-xs">
                  Sold Out
                </Badge>
              </div>
            ) : isLowAvailability ? (
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-500 text-white text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {availableSeats} left
                </Badge>
              </div>
            ) : null}

            {/* Verified Badge */}
            {service.provider.isVerified && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Verified
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              {service.avgRating && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {service.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {service.description}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {service.location || service.provider.businessName}
              </span>
            </div>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold">
                {formatCurrency(service.basePrice)}
              </span>
              <span className="text-sm text-muted-foreground">
                {priceUnit}
              </span>
            </div>
            {service.reviewCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {service.reviewCount} review{service.reviewCount !== 1 ? "s" : ""}
              </span>
            )}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
