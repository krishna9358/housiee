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
  Plane,
  Shirt,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Explore travel, food, accommodation, and laundry services from verified providers.",
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border shadow-sm">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-6 w-20" />
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
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No services found</h3>
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{services.length}</span> of{" "}
          <span className="font-medium text-foreground">{data.pagination.total}</span> services
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
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
      label: "All",
      icon: Sparkles,
    },
    {
      value: "TRAVEL",
      label: "Travel",
      icon: Plane,
    },
    {
      value: "FOOD",
      label: "Food",
      icon: Utensils,
    },
    {
      value: "ACCOMMODATION",
      label: "Stays",
      icon: Home,
    },
    {
      value: "LAUNDRY",
      label: "Laundry",
      icon: Shirt,
    },
  ];

  const categoryLabels: Record<string, string> = {
    TRAVEL: "Travel Services",
    FOOD: "Food Services",
    ACCOMMODATION: "Accommodation",
    LAUNDRY: "Laundry Services",
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Header */}
      <div className="border-b bg-background sticky top-16 z-30">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {category ? categoryLabels[category] || "Services" : "Browse Services"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Find the best services from verified providers
              </p>
            </div>

            <Button variant="outline" size="sm" className="gap-2 w-fit">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto scroll-container pb-2 -mx-4 px-4">
            {categories.map((cat) => {
              const isActive = category === cat.value || (!category && !cat.value);
              return (
                <Link
                  key={cat.label}
                  href={cat.value ? `/services?category=${cat.value}` : "/services"}
                >
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-colors whitespace-nowrap
                      ${isActive ? "" : "hover:bg-accent"}
                    `}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <Suspense fallback={<ServicesSkeleton />}>
          <ServicesList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
