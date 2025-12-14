import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { api, Service } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Home,
  Utensils,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore our curated selection of accommodation and food services from verified providers.",
};

async function getServices(params: Record<string, string>) {
  try {
    const data = await api.services.list(params);
    return data;
  } catch {
    return {
      services: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }
}

function ServicesSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-lg">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

async function ServicesList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const data = await getServices(params);
  const services = data.services as Service[];

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/5 flex items-center justify-center">
          <Search className="h-10 w-10 text-primary/40" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No services found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Try adjusting your filters or browse all available services
        </p>
        <Button asChild>
          <Link href="/services">View All Services</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{services.length}</span> of{" "}
          <span className="font-medium text-foreground">{data.pagination.total}</span> services
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={page === data.pagination.page ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link
                  href={`/services?page=${page}${params.category ? `&category=${params.category}` : ""}`}
                >
                  {page}
                </Link>
              </Button>
            )
          )}
        </div>
      )}
    </>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const category = params.category;

  const categories = [
    {
      value: null,
      label: "All Services",
      icon: Sparkles,
      count: "800+",
      color: "text-primary",
      bg: "bg-primary/10",
      activeBg: "bg-primary text-white",
    },
    {
      value: "ACCOMMODATION",
      label: "Accommodation",
      icon: Home,
      count: "500+",
      color: "text-blue-600",
      bg: "bg-blue-50",
      activeBg: "bg-blue-500 text-white",
    },
    {
      value: "FOOD",
      label: "Food Services",
      icon: Utensils,
      count: "300+",
      color: "text-orange-600",
      bg: "bg-orange-50",
      activeBg: "bg-orange-500 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-xl sticky top-16 z-30">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
                {category === "ACCOMMODATION"
                  ? "Accommodation"
                  : category === "FOOD"
                    ? "Food Services"
                    : "Browse Services"}
              </h1>
              <p className="text-muted-foreground">
                {category === "ACCOMMODATION"
                  ? "Find your perfect stay from our verified providers"
                  : category === "FOOD"
                    ? "Discover culinary delights from local chefs"
                    : "Explore our curated selection of premium services"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = category === cat.value || (!category && !cat.value);
              return (
                <Link
                  key={cat.label}
                  href={cat.value ? `/services?category=${cat.value}` : "/services"}
                >
                  <Badge
                    variant="outline"
                    className={`
                      flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all
                      ${
                        isActive
                          ? cat.activeBg + " border-transparent shadow-lg"
                          : `${cat.bg} ${cat.color} border-transparent hover:shadow-md`
                      }
                    `}
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.label}
                    <span
                      className={`text-xs ${isActive ? "opacity-80" : "opacity-60"}`}
                    >
                      {cat.count}
                    </span>
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <Suspense fallback={<ServicesSkeleton />}>
          <ServicesList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
