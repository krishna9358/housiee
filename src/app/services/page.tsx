import { Suspense } from "react";
import { Metadata } from "next";
import { ServiceCard } from "@/components/service-card";
import { api, Service } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Browse Services",
  description: "Explore our curated selection of accommodation and food services from verified providers.",
};

async function getServices(params: Record<string, string>) {
  try {
    const data = await api.services.list(params);
    return data;
  } catch {
    return { services: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
  }
}

function ServicesSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function ServicesList({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const data = await getServices(params);
  const services = data.services as Service[];

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No services found</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const category = params.category;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
          {category === "ACCOMMODATION"
            ? "Accommodation"
            : category === "FOOD"
            ? "Food Services"
            : "All Services"}
        </h1>
        <p className="text-muted-foreground">
          {category === "ACCOMMODATION"
            ? "Find your perfect stay from our verified providers"
            : category === "FOOD"
            ? "Discover culinary delights from local chefs"
            : "Explore our curated selection of services"}
        </p>
      </div>

      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
