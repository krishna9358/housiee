"use client";

import { Button, Card, CardBody, Chip, Avatar, Textarea, Input } from "@nextui-org/react";
import { MapPin, Star, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  street: string;
  city: string;
  state: string;
  price: number;
  priceUnit: string;
  images: string[];
  amenities: string[];
  avgRating: number | null;
  reviewCount: number;
  providerId: string;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [listingRes, reviewsRes] = await Promise.all([
      api.get<Listing>(`/listings/${id}`),
      api.get<{ items: Review[] }>(`/reviews/listing/${id}`),
    ]);

    if (listingRes.success && listingRes.data) {
      setListing(listingRes.data);
    }
    if (reviewsRes.success && reviewsRes.data) {
      setReviews(reviewsRes.data.items);
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setBookingLoading(true);
    const res = await api.post("/bookings", {
      listingId: id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      quantity,
    });

    if (res.success) {
      router.push("/dashboard/bookings");
    } else {
      alert(res.error || "Booking failed");
    }
    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-slate-200 rounded-2xl" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
          <Button as={Link} href="/listings" className="mt-4">
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button as={Link} href="/listings" variant="light" startContent={<ArrowLeft className="w-4 h-4" />} className="mb-6">
          Back to Listings
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 rounded-2xl overflow-hidden bg-slate-200">
              <img
                src={listing.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <Chip size="lg" className="absolute top-4 left-4 bg-white/90 font-semibold">
                {listing.category}
              </Chip>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-5 h-5" />
                  {listing.city}, {listing.state}
                </div>
                {listing.avgRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{listing.avgRating.toFixed(1)}</span>
                    <span className="text-slate-500">({listing.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            <Card className="shadow-sm">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-slate-600 whitespace-pre-line">{listing.description}</p>
              </CardBody>
            </Card>

            {listing.amenities.length > 0 && (
              <Card className="shadow-sm">
                <CardBody className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity, i) => (
                      <Chip key={i} variant="flat" color="primary">
                        {amenity}
                      </Chip>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
                {reviews.length === 0 ? (
                  <p className="text-slate-500">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar size="sm" />
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <CardBody className="p-6 space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-600">₹{listing.price}</span>
                  <span className="text-slate-500 text-lg">/{listing.priceUnit}</span>
                </div>

                <div className="space-y-4">
                  {(listing.category === "ACCOMMODATION" || listing.category === "TRAVEL") && (
                    <>
                      <Input
                        type="date"
                        label="Start Date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        startContent={<Calendar className="w-4 h-4 text-slate-400" />}
                      />
                      <Input
                        type="date"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        startContent={<Calendar className="w-4 h-4 text-slate-400" />}
                      />
                    </>
                  )}
                  <Input
                    type="number"
                    label="Quantity"
                    value={quantity.toString()}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>

                <Button
                  color="primary"
                  size="lg"
                  fullWidth
                  className="font-semibold"
                  isLoading={bookingLoading}
                  onClick={handleBook}
                >
                  {user ? "Book Now" : "Login to Book"}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
