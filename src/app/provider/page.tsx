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
import { Loader2, Plus, DollarSign, Package, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your services and bookings</p>
        </div>
        <Button asChild>
          <Link href="/provider/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2) || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Services
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.activeServices || 0}/{stats?.totalServices || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.pendingBookings || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="bookings">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="services">My Services</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{booking.service.title}</h3>
                              <Badge className={statusColors[booking.status]}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Customer: {booking.user.name} ({booking.user.email})</p>
                              <p>
                                Date: {new Date(booking.startDate).toLocaleDateString()}
                                {booking.endDate && ` - ${new Date(booking.endDate).toLocaleDateString()}`}
                              </p>
                              {booking.notes && <p>Notes: {booking.notes}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xl font-bold">${booking.totalPrice}</p>
                            {booking.status === "PENDING" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, "CANCELLED")}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, "COMPLETED")}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No services yet</p>
                  <Button asChild>
                    <Link href="/provider/services/new">Add Your First Service</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{service.title}</h3>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.category}
                        </p>
                        <p className="text-lg font-bold mb-4">${service.basePrice}</p>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`/provider/services/${service.id}/edit`}>Edit</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
