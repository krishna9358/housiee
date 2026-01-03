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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Plus,
  IndianRupee,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statusConfig: Record<
  string,
  { color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  CONFIRMED: {
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900/30",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  COMPLETED: {
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
};

function StatsCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

function BookingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-lg border">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

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
      console.error(error);
      if (error instanceof Error && error.message === "Provider profile not found") {
        toast.error("Profile missing. Please complete your provider profile.");
        router.push("/become-provider");
        return;
      }
      toast.error("Failed to load data");
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
            Provider Dashboard
          </motion.h1>
          <p className="text-muted-foreground text-sm">
            Manage your services and bookings
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            {[
              {
                title: "Total Revenue",
                value: formatCurrency(stats?.totalRevenue || 0),
                icon: IndianRupee,
              },
              {
                title: "Active Services",
                value: `${stats?.activeServices || 0}/${stats?.totalServices || 0}`,
                icon: Package,
              },
              {
                title: "Total Bookings",
                value: stats?.totalBookings || 0,
                icon: Calendar,
              },
              {
                title: "Pending",
                value: stats?.pendingBookings || 0,
                icon: Clock,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Revenue Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Main Content */}
      <Card className="border-0 shadow-sm">
        <Tabs defaultValue="bookings">
          <CardHeader className="border-b pb-0">
            <TabsList className="w-full justify-start bg-transparent gap-4 h-auto p-0">
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Bookings ({bookings.length})
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Services ({services.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-4">
            <TabsContent value="bookings" className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <BookingSkeleton key={i} />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">No bookings yet</p>
                  <p className="text-muted-foreground text-sm">
                    Bookings will appear here when customers book your services
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">
                              {booking.service.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`${statusConfig[booking.status].bg} ${statusConfig[booking.status].color} text-xs gap-1`}
                            >
                              {statusConfig[booking.status].icon}
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium text-foreground">
                                {booking.user.name}
                              </span>{" "}
                              • {booking.user.email}
                            </p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(booking.startDate)}
                              {booking.quantity > 1 && (
                                <span className="ml-2">• Qty: {booking.quantity}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-lg font-bold">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                          {booking.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking.id, "CONFIRMED")
                                }
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(booking.id, "CANCELLED")
                                }
                                className="text-destructive"
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
                              Complete
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
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">No services yet</p>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Create your first service to start accepting bookings
                  </p>
                  <Button asChild size="sm">
                    <Link href="/provider/services/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
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
                      <Card className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">
                                {service.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {service.category}
                              </p>
                            </div>
                            <Badge
                              variant={service.isActive ? "default" : "secondary"}
                              className="text-xs shrink-0"
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold mb-3">
                            {formatCurrency(service.basePrice)}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
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
    </div>
  );
}
