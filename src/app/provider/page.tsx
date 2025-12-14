"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { api, ProviderStats, Service, ProviderBooking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  DollarSign,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  Edit,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  CONFIRMED: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  COMPLETED: {
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
};

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/provider");
      } else if (user?.role === "USER") {
        router.push("/become-provider");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "USER") {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [statsData, servicesData, bookingsData] = await Promise.all([
        api.provider.dashboardStats(),
        api.services.myServices(),
        api.bookings.providerBookings(),
      ]);
      setStats(statsData);
      setServices(servicesData);
      setBookings(bookingsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await api.bookings.updateStatus(bookingId, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      loadData();
    } catch (error) {
      toast.error("Failed to update booking");
      console.error(error);
    }
  };

  if (authLoading || !isAuthenticated || user?.role === "USER") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl font-bold mb-2"
          >
            Provider Dashboard
          </motion.h1>
          <p className="text-muted-foreground">
            Manage your services and bookings
          </p>
        </div>
        <Button
          asChild
          className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80"
        >
          <Link href="/provider/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Revenue",
                value: `$${stats?.totalRevenue.toFixed(2) || "0.00"}`,
                icon: DollarSign,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                trend: "+12% from last month",
              },
              {
                title: "Active Services",
                value: `${stats?.activeServices || 0}/${stats?.totalServices || 0}`,
                icon: Package,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Total Bookings",
                value: stats?.totalBookings || 0,
                icon: Calendar,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                title: "Pending",
                value: stats?.pendingBookings || 0,
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.trend && (
                          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {stat.trend}
                          </p>
                        )}
                      </div>
                      <div
                        className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center`}
                      >
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <Card className="border-0 shadow-lg">
            <Tabs defaultValue="bookings" className="w-full">
              <CardHeader className="border-b bg-muted/30 pb-0">
                <TabsList className="w-full justify-start bg-transparent gap-4 h-auto p-0">
                  <TabsTrigger
                    value="bookings"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                  >
                    Bookings ({bookings.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                  >
                    My Services ({services.length})
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                <TabsContent value="bookings" className="mt-0">
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-primary/40" />
                      </div>
                      <p className="text-muted-foreground">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking, i) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-semibold">
                                  {booking.service.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`${statusConfig[booking.status].bg} ${statusConfig[booking.status].color} border gap-1`}
                                >
                                  {statusConfig[booking.status].icon}
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>
                                  <span className="font-medium text-foreground">
                                    {booking.user.name}
                                  </span>{" "}
                                  ({booking.user.email})
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(
                                    booking.startDate
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                  {booking.endDate &&
                                    ` - ${new Date(booking.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`}
                                </p>
                                {booking.notes && (
                                  <p className="text-xs italic">
                                    "{booking.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <p className="text-2xl font-bold text-primary">
                                ${booking.totalPrice}
                              </p>
                              {booking.status === "PENDING" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "CONFIRMED"
                                      )
                                    }
                                    className="shadow-md"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "CANCELLED"
                                      )
                                    }
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusChange(booking.id, "COMPLETED")
                                  }
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="services" className="mt-0">
                  {services.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Package className="h-8 w-8 text-primary/40" />
                      </div>
                      <p className="text-muted-foreground mb-4">
                        No services yet
                      </p>
                      <Button asChild>
                        <Link href="/provider/services/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Service
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service, i) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className="border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">
                                    {service.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {service.category}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    service.isActive ? "default" : "secondary"
                                  }
                                  className={
                                    service.isActive
                                      ? "bg-emerald-500"
                                      : "bg-gray-400"
                                  }
                                >
                                  {service.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-2xl font-bold text-primary mb-4">
                                ${service.basePrice}
                                <span className="text-sm font-normal text-muted-foreground">
                                  {service.category === "ACCOMMODATION"
                                    ? "/night"
                                    : ""}
                                </span>
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="flex-1"
                                >
                                  <Link href={`/services/${service.id}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="flex-1"
                                >
                                  <Link
                                    href={`/provider/services/${service.id}/edit`}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}
