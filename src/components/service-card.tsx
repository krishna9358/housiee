"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Utensils,
  Home,
  CheckCircle,
  Heart,
  ArrowRight,
} from "lucide-react";
import type { Service } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ServiceCardProps {
  service: Service;
  variant?: "default" | "compact" | "featured";
}

export function ServiceCard({ service, variant = "default" }: ServiceCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const imageUrl = service.images[0]
    ? service.images[0].startsWith("http")
      ? service.images[0]
      : `${API_URL}${service.images[0]}`
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

  if (variant === "compact") {
    return (
      <Link href={`/services/${service.id}`}>
        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full flex">
          <div className="relative w-24 sm:w-32 shrink-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="128px"
            />
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    service.category === "ACCOMMODATION"
                      ? "text-blue-600 border-blue-200 bg-blue-50"
                      : "text-orange-600 border-orange-200 bg-orange-50"
                  )}
                >
                  {service.category === "ACCOMMODATION" ? "Stay" : "Food"}
                </Badge>
                {service.provider.isVerified && (
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                )}
              </div>
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-primary">${service.basePrice}</span>
              {service.avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">
                    {service.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/services/${service.id}`}>
        <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover h-full">
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge
                className={cn(
                  "flex items-center gap-1 shadow-lg",
                  service.category === "ACCOMMODATION"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-orange-500 hover:bg-orange-600"
                )}
              >
                {service.category === "ACCOMMODATION" ? (
                  <Home className="h-3 w-3" />
                ) : (
                  <Utensils className="h-3 w-3" />
                )}
                {service.category === "ACCOMMODATION" ? "Stay" : "Food"}
              </Badge>
              {service.provider.isVerified && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-lg">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
              />
            </button>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="font-bold text-xl mb-1 group-hover:text-white/90">
                {service.title}
              </h3>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{service.provider.businessName}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {service.description}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">
                  ${service.basePrice}
                </span>
                <span className="text-sm text-muted-foreground">
                  {service.category === "ACCOMMODATION" ? "/night" : ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {service.avgRating && (
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">
                      {service.avgRating.toFixed(1)}
                    </span>
                  </div>
                )}
                <Button size="sm" className="gap-1 shadow-md shadow-primary/20">
                  Book Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
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
        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover h-full">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <Badge
                className={cn(
                  "flex items-center gap-1 shadow-md",
                  service.category === "ACCOMMODATION"
                    ? "bg-blue-500/90 hover:bg-blue-600"
                    : "bg-orange-500/90 hover:bg-orange-600"
                )}
              >
                {service.category === "ACCOMMODATION" ? (
                  <Home className="h-3 w-3" />
                ) : (
                  <Utensils className="h-3 w-3" />
                )}
                {service.category === "ACCOMMODATION" ? "Stay" : "Food"}
              </Badge>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                  )}
                />
              </button>
            </div>

            {/* Verified badge */}
            {service.provider.isVerified && (
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="outline"
                  className="bg-white/90 backdrop-blur-sm text-emerald-600 border-emerald-200 shadow-md"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              {service.avgRating && (
                <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-md">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
              <span className="truncate">{service.provider.businessName}</span>
            </div>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                ${service.basePrice}
              </span>
              <span className="text-sm text-muted-foreground">
                {service.category === "ACCOMMODATION" ? "/night" : ""}
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
