"use client";

import { Card, CardBody, Chip, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Check, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Booking {
  id: string;
  listingId: string;
  userId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

const statusColors: Record<string, "warning" | "primary" | "danger" | "success"> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  CANCELLED: "danger",
  COMPLETED: "success",
};

export default function ProviderBookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }
    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await api.get<{ items: Booking[] }>("/provider/bookings");
    if (res.success && res.data) {
      setBookings(res.data.items);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: "confirm" | "complete" | "cancel") => {
    const res = await api.post(`/provider/bookings/${id}/${action}`, {});
    if (res.success) fetchBookings();
  };

  if (!user || user.role !== "PROVIDER") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Bookings</h1>

        <Card>
          <CardBody className="p-0">
            <Table aria-label="Bookings table">
              <TableHeader>
                <TableColumn>BOOKING ID</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>QUANTITY</TableColumn>
                <TableColumn>TOTAL</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No bookings found">
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{booking.quantity}</TableCell>
                    <TableCell className="font-semibold">₹{booking.totalPrice}</TableCell>
                    <TableCell>
                      <Chip size="sm" color={statusColors[booking.status]} variant="flat">
                        {booking.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {booking.status === "PENDING" && (
                          <>
                            <Button size="sm" color="success" variant="flat" onClick={() => handleAction(booking.id, "confirm")} startContent={<Check className="w-3 h-3" />}>
                              Confirm
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onClick={() => handleAction(booking.id, "cancel")} startContent={<X className="w-3 h-3" />}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <Button size="sm" color="primary" variant="flat" onClick={() => handleAction(booking.id, "complete")}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
