"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Utensils, Home, CheckCircle } from "lucide-react";
import type { Service } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ServiceCard({ service }: { service: Service }) {
  const imageUrl = service.images[0]
    ? service.images[0].startsWith("http")
      ? service.images[0]
      : `${API_URL}${service.images[0]}`
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

  return (
    <Link href={`/services/${service.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant={service.category === "ACCOMMODATION" ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {service.category === "ACCOMMODATION" ? (
                <Home className="h-3 w-3" />
              ) : (
                <Utensils className="h-3 w-3" />
              )}
              {service.category === "ACCOMMODATION" ? "Stay" : "Food"}
            </Badge>
          </div>
          {service.provider.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-white/90 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
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
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{service.provider.businessName}</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">${service.basePrice}</span>
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
  );
}
