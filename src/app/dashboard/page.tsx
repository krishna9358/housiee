"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { api, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";

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

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const data = await api.bookings.myBookings();
      setBookings(data);
    } catch (error) {
      toast.error("Failed to load bookings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.bookings.updateStatus(id, "CANCELLED");
      toast.success("Booking cancelled");
      loadBookings();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status)
  );

  const totalSpent = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          Welcome, {user?.name?.split(" ")[0]}! 👋
        </motion.h1>
        <p className="text-muted-foreground text-sm">
          Manage your bookings and explore services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Bookings",
            value: bookings.length,
            icon: Package,
          },
          {
            title: "Pending",
            value: pendingBookings.length,
            icon: Clock,
          },
          {
            title: "Confirmed",
            value: confirmedBookings.length,
            icon: CheckCircle2,
          },
          {
            title: "Total Spent",
            value: formatCurrency(totalSpent),
            icon: IndianRupee,
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
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
      </div>

      {/* Bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b pb-0">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full justify-start bg-transparent gap-4 h-auto p-0">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Upcoming ({pendingBookings.length + confirmedBookings.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsContent value="upcoming" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : [...pendingBookings, ...confirmedBookings].length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No upcoming bookings
                  </p>
                  <Button asChild size="sm">
                    <Link href="/services">
                      Browse Services
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...pendingBookings, ...confirmedBookings].map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <div className="space-y-1.5">
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
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(booking.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {booking.service.provider.businessName}
                            </span>
                            {booking.quantity > 1 && (
                              <span>Qty: {booking.quantity}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                          {booking.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(booking.id)}
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              {pastBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No past bookings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
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
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(booking.startDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                          {booking.status === "COMPLETED" && (
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
