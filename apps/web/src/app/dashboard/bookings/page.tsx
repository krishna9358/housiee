"use client";

import { Card, CardBody, Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, useDisclosure } from "@nextui-org/react";
import { Calendar, MapPin, Star } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Booking {
  id: string;
  listingId: string;
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

export default function BookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await api.get<{ items: Booking[] }>("/bookings/me");
    if (res.success && res.data) {
      setBookings(res.data.items);
    }
    setLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    const res = await api.post(`/bookings/${bookingId}/cancel`, {});
    if (res.success) {
      fetchBookings();
    }
  };

  const openReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    onOpen();
  };

  const submitReview = async () => {
    if (!selectedBooking) return;
    setReviewLoading(true);
    const res = await api.post("/reviews", {
      listingId: selectedBooking.listingId,
      rating,
      comment,
    });
    if (res.success) {
      onClose();
      setComment("");
      setRating(5);
    } else {
      alert(res.error || "Failed to submit review");
    }
    setReviewLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardBody className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardBody className="p-8 text-center">
              <p className="text-slate-500 mb-4">You don't have any bookings yet</p>
              <Button color="primary" onClick={() => router.push("/listings")}>
                Browse Services
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="shadow-sm">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">Booking #{booking.id.slice(0, 8)}</h3>
                        <Chip size="sm" color={statusColors[booking.status]} variant="flat">
                          {booking.status}
                        </Chip>
                      </div>
                      {booking.startDate && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.startDate).toLocaleDateString()}
                          {booking.endDate && ` - ${new Date(booking.endDate).toLocaleDateString()}`}
                        </div>
                      )}
                      <p className="text-sm text-slate-500 mt-1">Quantity: {booking.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₹{booking.totalPrice}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {["PENDING", "CONFIRMED"].includes(booking.status) && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {booking.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Star className="w-4 h-4" />}
                        onClick={() => openReviewModal(booking)}
                      >
                        Leave Review
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Leave a Review</ModalHeader>
          <ModalBody>
            <div className="flex gap-2 justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              label="Your Review"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              minRows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" onClick={submitReview} isLoading={reviewLoading}>
              Submit Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
