"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers";
import { api, Service } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Edit,
  Eye,
  Trash2,
  Package,
  Plane,
  Utensils,
  Home,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const categoryConfig = {
  TRAVEL: { icon: Plane, color: "text-blue-600" },
  FOOD: { icon: Utensils, color: "text-orange-600" },
  ACCOMMODATION: { icon: Home, color: "text-green-600" },
  LAUNDRY: { icon: Shirt, color: "text-purple-600" },
};

export default function ProviderServicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  const loadServices = async () => {
    try {
      const data = await api.services.myServices();
      setServices(data);
    } catch (error) {
      toast.error("Failed to load services");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await api.services.delete(id);
      toast.success("Service deleted");
      loadServices();
    } catch (error) {
      toast.error("Failed to delete service");
      console.error(error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            My Services
          </motion.h1>
          <p className="text-muted-foreground text-sm">
            Manage your service listings
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Link>
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first service listing to start accepting bookings
          </p>
          <Button asChild>
            <Link href="/provider/services/new">
              <Plus className="h-4 w-4 mr-2" />
              Create First Service
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => {
            const imageUrl = service.images[0]
              ? service.images[0].startsWith("http")
                ? service.images[0]
                : `${API_URL}${service.images[0]}`
              : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";

            const catConfig = categoryConfig[service.category] || categoryConfig.ACCOMMODATION;
            const CategoryIcon = catConfig.icon;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className={catConfig.color}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {service.category}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate mb-1">
                      {service.title}
                    </h3>
                    <p className="text-lg font-bold mb-2">
                      {formatCurrency(service.basePrice)}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.bookedCount}/{service.capacity} booked
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/services/${service.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/provider/services/${service.id}/edit`}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
