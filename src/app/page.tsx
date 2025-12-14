"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Star,
  Shield,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Plane,
  Utensils,
  Home,
  Shirt,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { api, Service, ServiceCategory } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const serviceCategories = [
  {
    id: "TRAVEL" as ServiceCategory,
    name: "Travel",
    description: "Book cabs, buses, and travel packages",
    icon: Plane,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "FOOD" as ServiceCategory,
    name: "Food",
    description: "Order meals, catering, and tiffin services",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "ACCOMMODATION" as ServiceCategory,
    name: "Accommodation",
    description: "Find PGs, hostels, and rental stays",
    icon: Home,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    color: "from-green-500 to-green-600",
  },
  {
    id: "LAUNDRY" as ServiceCategory,
    name: "Laundry",
    description: "Wash, iron, and dry-clean services",
    icon: Shirt,
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&h=600&fit=crop",
    color: "from-purple-500 to-purple-600",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Providers",
    description: "All providers are vetted for quality",
  },
  {
    icon: Star,
    title: "Genuine Reviews",
    description: "Real feedback from customers",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book services in seconds",
  },
  {
    icon: Heart,
    title: "24/7 Support",
    description: "We're always here to help",
  },
];

function ServiceScrollerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[280px] sm:w-[300px]">
            <Card className="overflow-hidden border-0 shadow-md">
              <Skeleton className="aspect-[4/3] w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceScroller({ 
  title, 
  category,
  services,
  isLoading,
}: { 
  title: string; 
  category: ServiceCategory;
  services: Service[];
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const priceUnit = {
    TRAVEL: "",
    FOOD: "/meal",
    ACCOMMODATION: "/night",
    LAUNDRY: "/kg",
  }[category] || "";

  if (isLoading) {
    return <ServiceScrollerSkeleton />;
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 min-h-screen">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href={`/services?category=${category}`}>
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-container pb-4 -mx-4 px-4"
      >
        {services.map((service, index) => {
          const imageUrl = service.images[0]
            ? service.images[0].startsWith("http")
              ? service.images[0]
              : `${API_URL}${service.images[0]}`
            : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop";

          const availableSeats = service.capacity - service.bookedCount;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 w-[280px] sm:w-[300px]"
            >
              <Link href={`/services/${service.id}`}>
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 card-hover h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    {availableSeats > 0 && availableSeats <= 5 && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-xs">
                          {availableSeats} left
                        </Badge>
                      </div>
                    )}
                    {availableSeats <= 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="text-xs">
                          Sold Out
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold line-clamp-1 mb-1">
                      {service.title}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{service.provider.businessName}</span>
                      {service.location && (
                        <>
                          <span>•</span>
                          <span>{service.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">
                          {formatCurrency(service.basePrice)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {priceUnit}
                        </span>
                      </div>
                      {service.avgRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{service.avgRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({service.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [servicesByCategory, setServicesByCategory] = useState<Record<ServiceCategory, Service[]>>({
    TRAVEL: [],
    FOOD: [],
    ACCOMMODATION: [],
    LAUNDRY: [],
  });
  const [categoryCounts, setCategoryCounts] = useState<Record<ServiceCategory, number>>({
    TRAVEL: 0,
    FOOD: 0,
    ACCOMMODATION: 0,
    LAUNDRY: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // Fetch services for each category
      const categories: ServiceCategory[] = ["TRAVEL", "FOOD", "ACCOMMODATION", "LAUNDRY"];
      const results = await Promise.all(
        categories.map((cat) => api.services.list({ category: cat, limit: "8" }))
      );

      const newServicesByCategory: Record<ServiceCategory, Service[]> = {
        TRAVEL: [],
        FOOD: [],
        ACCOMMODATION: [],
        LAUNDRY: [],
      };
      const newCounts: Record<ServiceCategory, number> = {
        TRAVEL: 0,
        FOOD: 0,
        ACCOMMODATION: 0,
        LAUNDRY: 0,
      };

      categories.forEach((cat, idx) => {
        newServicesByCategory[cat] = results[idx].services;
        newCounts[cat] = results[idx].pagination.total;
      });

      setServicesByCategory(newServicesByCategory);
      setCategoryCounts(newCounts);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4">
                <CheckCircle className="h-3 w-3 mr-1" />
                Trusted by 10,000+ users
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                All Your Services,
                <br />
                <span className="text-muted-foreground">One Platform</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Book travel, food, accommodation, and laundry services from verified
                providers. Simple, fast, and reliable.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-12 px-6">
                  <Link href="/services">
                    Browse Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-6">
                  <Link href="/become-provider">Become a Provider</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Explore Services
            </h2>
            <p className="text-muted-foreground">
              Choose from a wide range of services
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/services?category=${category.id}`}>
                  <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 card-hover">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-3`}>
                          <category.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-white/80">
                          {isLoading ? (
                            <Skeleton className="h-4 w-20 bg-white/20" />
                          ) : (
                            `${categoryCounts[category.id]}+ providers`
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services by Category */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 space-y-12">
          <ServiceScroller
            title="🚗 Travel Services"
            category="TRAVEL"
            services={servicesByCategory.TRAVEL}
            isLoading={isLoading}
          />
          <ServiceScroller
            title="🍽️ Food Services"
            category="FOOD"
            services={servicesByCategory.FOOD}
            isLoading={isLoading}
          />
          <ServiceScroller
            title="🏠 Accommodation"
            category="ACCOMMODATION"
            services={servicesByCategory.ACCOMMODATION}
            isLoading={isLoading}
          />
          <ServiceScroller
            title="👕 Laundry Services"
            category="LAUNDRY"
            services={servicesByCategory.LAUNDRY}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-6 border-0 shadow-sm h-full">
                  <CardContent className="pt-0 space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 border-t">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to List Your Service?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join our community of providers and reach thousands of customers.
              Easy setup, transparent pricing, and dedicated support.
            </p>
            <Button size="lg" asChild className="h-12 px-8">
              <Link href="/become-provider">
                Become a Provider
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
