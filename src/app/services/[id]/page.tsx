import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Home, Utensils, Users, Bed, Bath, Clock, Truck } from "lucide-react";
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

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={service.category === "ACCOMMODATION" ? "default" : "secondary"}>
              {service.category === "ACCOMMODATION" ? (
                <Home className="h-3 w-3 mr-1" />
              ) : (
                <Utensils className="h-3 w-3 mr-1" />
              )}
              {service.category === "ACCOMMODATION" ? "Accommodation" : "Food Service"}
            </Badge>
            {service.provider.isVerified && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Provider
              </Badge>
            )}
          </div>

          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{service.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{service.provider.businessName}</span>
              {service.avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{service.avgRating.toFixed(1)}</span>
                  <span>({service.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground whitespace-pre-line">{service.description}</p>
          </section>

          {service.accommodationDetails && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium">{service.accommodationDetails.propertyType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{service.accommodationDetails.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{service.accommodationDetails.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
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
                <div className="mt-4 flex gap-4">
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

          {service.foodDetails && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Food Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Utensils className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cuisine Type</p>
                    <p className="font-medium">{service.foodDetails.cuisineType}</p>
                  </div>
                </div>
                {service.foodDetails.servingSize && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Serving Size</p>
                      <p className="font-medium">{service.foodDetails.servingSize}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="font-medium">
                      {service.foodDetails.deliveryAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
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
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingForm
              serviceId={service.id}
              basePrice={service.basePrice}
              category={service.category}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
