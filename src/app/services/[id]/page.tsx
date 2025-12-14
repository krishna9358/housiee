import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Star,
  CheckCircle,
  Home,
  Utensils,
  Users,
  Bed,
  Bath,
  Clock,
  Truck,
  Plane,
  Shirt,
  MapPin,
  Car,
  Fuel,
  Thermometer,
  User,
  AlertCircle,
} from "lucide-react";
import { BookingForm } from "./booking-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const service = await api.services.get(id);
    return {
      title: service.title,
      description: service.description.slice(0, 160),
      openGraph: {
        title: service.title,
        description: service.description.slice(0, 160),
        images: service.images[0]
          ? [
              {
                url: service.images[0].startsWith("http")
                  ? service.images[0]
                  : `${API_URL}${service.images[0]}`,
                width: 1200,
                height: 630,
              },
            ]
          : [],
      },
    };
  } catch {
    return { title: "Service Not Found" };
  }
}

const categoryConfig = {
  TRAVEL: { icon: Plane, label: "Travel", color: "text-blue-600" },
  FOOD: { icon: Utensils, label: "Food", color: "text-orange-600" },
  ACCOMMODATION: { icon: Home, label: "Accommodation", color: "text-green-600" },
  LAUNDRY: { icon: Shirt, label: "Laundry", color: "text-purple-600" },
};

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  let service;
  try {
    service = await api.services.get(id);
  } catch {
    notFound();
  }

  const imageUrl = service.images[0]
    ? service.images[0].startsWith("http")
      ? service.images[0]
      : `${API_URL}${service.images[0]}`
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop";

  const categoryInfo = categoryConfig[service.category] || categoryConfig.ACCOMMODATION;
  const CategoryIcon = categoryInfo.icon;
  const availableSeats = service.capacity - service.bookedCount;

  return (
    <article className="container mx-auto px-4 lg:px-8 py-8 page-enter">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            {/* Availability Badge */}
            {availableSeats <= 0 ? (
              <div className="absolute top-4 right-4">
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  Sold Out
                </Badge>
              </div>
            ) : availableSeats <= 5 ? (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500 text-white text-sm px-3 py-1">
                  Only {availableSeats} left!
                </Badge>
              </div>
            ) : null}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={categoryInfo.color}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {categoryInfo.label}
            </Badge>
            {service.provider.isVerified && (
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Provider
              </Badge>
            )}
          </div>

          {/* Title & Provider */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{service.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {service.provider.businessName}
              </span>
              {service.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {service.location}
                </span>
              )}
              {service.avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">
                    {service.avgRating.toFixed(1)}
                  </span>
                  <span>({service.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & Availability */}
          <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 border">
            <div>
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold">{formatCurrency(service.basePrice)}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-lg font-semibold">
                {availableSeats > 0 ? `${availableSeats} / ${service.capacity}` : "Sold Out"}
              </p>
            </div>
            {service.duration && (
              <>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">{service.duration} mins</p>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {service.description}
            </p>
          </section>

          {/* Accommodation Details */}
          {service.accommodationDetails && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium">{service.accommodationDetails.propertyType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{service.accommodationDetails.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{service.accommodationDetails.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Max Guests</p>
                    <p className="font-medium">{service.accommodationDetails.maxGuests}</p>
                  </div>
                </div>
              </div>
              {service.accommodationDetails.amenities.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.accommodationDetails.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(service.accommodationDetails.checkInTime || service.accommodationDetails.checkOutTime) && (
                <div className="mt-4 flex flex-wrap gap-6">
                  {service.accommodationDetails.checkInTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Check-in: {service.accommodationDetails.checkInTime}</span>
                    </div>
                  )}
                  {service.accommodationDetails.checkOutTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Check-out: {service.accommodationDetails.checkOutTime}</span>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Food Details */}
          {service.foodDetails && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Food Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Utensils className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cuisine Type</p>
                    <p className="font-medium">{service.foodDetails.cuisineType}</p>
                  </div>
                </div>
                {service.foodDetails.servingSize && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Serving Size</p>
                      <p className="font-medium">{service.foodDetails.servingSize}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="font-medium">
                      {service.foodDetails.deliveryAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
                {service.foodDetails.preparationTime && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prep Time</p>
                      <p className="font-medium">{service.foodDetails.preparationTime} mins</p>
                    </div>
                  </div>
                )}
              </div>
              {service.foodDetails.mealTypes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Meal Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.foodDetails.mealTypes.map((meal) => (
                      <Badge key={meal} variant="secondary">
                        {meal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {service.foodDetails.dietaryOptions.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Dietary Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.foodDetails.dietaryOptions.map((option) => (
                      <Badge key={option} variant="outline">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Travel Details */}
          {service.travelDetails && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Travel Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Type</p>
                    <p className="font-medium">{service.travelDetails.vehicleType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seating Capacity</p>
                    <p className="font-medium">{service.travelDetails.seatingCapacity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Thermometer className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">AC</p>
                    <p className="font-medium">
                      {service.travelDetails.acAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Fuel className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel</p>
                    <p className="font-medium">
                      {service.travelDetails.fuelIncluded ? "Included" : "Not Included"}
                    </p>
                  </div>
                </div>
              </div>
              {(service.travelDetails.pickupLocation || service.travelDetails.dropLocation) && (
                <div className="mt-4 flex flex-wrap gap-6">
                  {service.travelDetails.pickupLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Pickup:</span>{" "}
                        {service.travelDetails.pickupLocation}
                      </span>
                    </div>
                  )}
                  {service.travelDetails.dropLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Drop:</span>{" "}
                        {service.travelDetails.dropLocation}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Laundry Details */}
          {service.laundryDetails && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Laundry Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {service.laundryDetails.pricePerKg && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                    <Shirt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price per Kg</p>
                      <p className="font-medium">{formatCurrency(service.laundryDetails.pricePerKg)}</p>
                    </div>
                  </div>
                )}
                {service.laundryDetails.pricePerPiece && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                    <Shirt className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price per Piece</p>
                      <p className="font-medium">{formatCurrency(service.laundryDetails.pricePerPiece)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Express Service</p>
                    <p className="font-medium">
                      {service.laundryDetails.expressAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup & Delivery</p>
                    <p className="font-medium">
                      {service.laundryDetails.pickupAvailable && service.laundryDetails.deliveryAvailable
                        ? "Both Available"
                        : service.laundryDetails.pickupAvailable
                          ? "Pickup Only"
                          : service.laundryDetails.deliveryAvailable
                            ? "Delivery Only"
                            : "Not Available"}
                    </p>
                  </div>
                </div>
              </div>
              {service.laundryDetails.serviceTypes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Service Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.laundryDetails.serviceTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Reviews */}
          {service.reviews.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                {service.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.user.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {availableSeats <= 0 ? (
              <div className="p-6 rounded-xl border bg-muted/50 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Currently Unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This service is fully booked. Please check back later.
                </p>
              </div>
            ) : (
              <BookingForm
                serviceId={service.id}
                basePrice={service.basePrice}
                category={service.category}
                availableSeats={availableSeats}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
