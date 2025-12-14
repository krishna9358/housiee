"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { api, ProviderBooking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
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

export default function ProviderBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const data = await api.bookings.providerBookings();
      setBookings(data);
    } catch (error) {
      toast.error("Failed to load bookings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.bookings.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      loadBookings();
    } catch (error) {
      toast.error("Failed to update booking");
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
  const otherBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          Booking Requests
        </motion.h1>
        <p className="text-muted-foreground text-sm">
          Manage customer bookings for your services
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <Tabs defaultValue="pending">
          <CardHeader className="border-b pb-0">
            <TabsList className="w-full justify-start bg-transparent gap-4 h-auto p-0">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Pending ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Confirmed ({confirmedBookings.length})
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                History ({otherBookings.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="pending" className="mt-0">
                  {pendingBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No pending bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onConfirm={() => handleStatusChange(booking.id, "CONFIRMED")}
                          onDecline={() => handleStatusChange(booking.id, "CANCELLED")}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="confirmed" className="mt-0">
                  {confirmedBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No confirmed bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {confirmedBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onComplete={() => handleStatusChange(booking.id, "COMPLETED")}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  {otherBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No booking history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {otherBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function BookingCard({
  booking,
  onConfirm,
  onDecline,
  onComplete,
}: {
  booking: ProviderBooking;
  onConfirm?: () => void;
  onDecline?: () => void;
  onComplete?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">{booking.service.title}</h3>
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
              <span className="font-medium text-foreground">{booking.user.name}</span>{" "}
              • {booking.user.email}
            </p>
            <p className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(booking.startDate)}
              {booking.quantity > 1 && (
                <span className="ml-2">• Qty: {booking.quantity}</span>
              )}
            </p>
            {booking.notes && (
              <p className="text-muted-foreground italic">"{booking.notes}"</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-lg font-bold">{formatCurrency(booking.totalPrice)}</p>
          {onConfirm && onDecline && (
            <div className="flex gap-2">
              <Button size="sm" onClick={onConfirm}>
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                className="text-destructive"
              >
                Decline
              </Button>
            </div>
          )}
          {onComplete && (
            <Button size="sm" variant="outline" onClick={onComplete}>
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
