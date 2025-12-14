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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl font-bold mb-2"
        >
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </motion.h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Bookings",
            value: bookings.length,
            icon: Package,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            title: "Pending",
            value: pendingBookings.length,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            title: "Confirmed",
            value: confirmedBookings.length,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            title: "Completed",
            value: pastBookings.filter((b) => b.status === "COMPLETED").length,
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50",
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bookings Tabs */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Your Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="upcoming">
                  Upcoming ({pendingBookings.length + confirmedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="p-6 pt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : [...pendingBookings, ...confirmedBookings].length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No upcoming bookings
                  </p>
                  <Button asChild>
                    <Link href="/services">
                      Browse Services
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...pendingBookings, ...confirmedBookings].map(
                    (booking, i) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">
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
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(booking.startDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                                {booking.endDate &&
                                  ` - ${new Date(booking.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {booking.service.provider.businessName}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-2xl font-bold text-primary">
                              ${booking.totalPrice}
                            </p>
                            {booking.status === "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(booking.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/services/${booking.serviceId}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="p-6 pt-4">
              {pastBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No past bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
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
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xl font-bold">
                            ${booking.totalPrice}
                          </p>
                          {booking.status === "COMPLETED" && (
                            <Button variant="outline" size="sm">
                              Leave Review
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
