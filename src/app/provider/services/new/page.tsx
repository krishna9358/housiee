"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { api, ServiceCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  ImagePlus,
  Plane,
  Utensils,
  Home,
  Shirt,
  X,
} from "lucide-react";

const categories: { value: ServiceCategory; label: string; icon: React.ElementType }[] = [
  { value: "TRAVEL", label: "Travel", icon: Plane },
  { value: "FOOD", label: "Food", icon: Utensils },
  { value: "ACCOMMODATION", label: "Accommodation", icon: Home },
  { value: "LAUNDRY", label: "Laundry", icon: Shirt },
];

export default function NewServicePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<ServiceCategory>("TRAVEL");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/provider/services/new");
    } else if (!authLoading && user?.role === "USER") {
      router.push("/become-provider");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    // Create previews
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Add images
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await api.services.create(formData);
      toast.success("Service created successfully!");
      router.push("/provider/services");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create service");
    } finally {
      setIsLoading(false);
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/services">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            Add New Service
          </motion.h1>
          <p className="text-muted-foreground text-sm">
            Create a new service listing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <CardDescription>General details about your service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Premium AC Bus to Mumbai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                name="category"
                value={category}
                onValueChange={(v) => setCategory(v as ServiceCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your service in detail..."
                rows={4}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Price (₹) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  placeholder="0"
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="1"
                  min={1}
                  defaultValue={1}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Max bookings/seats available
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Bangalore, Karnataka"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
            <CardDescription>Add up to 5 images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    multiple
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category-specific fields */}
        {category === "ACCOMMODATION" && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Input
                    id="propertyType"
                    name="propertyType"
                    placeholder="e.g., Apartment, House, PG"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input
                    id="maxGuests"
                    name="maxGuests"
                    type="number"
                    placeholder="2"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="1"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="1"
                    min={0}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    name="checkInTime"
                    placeholder="e.g., 2:00 PM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input
                    id="checkOutTime"
                    name="checkOutTime"
                    placeholder="e.g., 11:00 AM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  name="amenities"
                  placeholder="e.g., WiFi, AC, Kitchen, Parking"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {category === "FOOD" && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Food Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type</Label>
                  <Input
                    id="cuisineType"
                    name="cuisineType"
                    placeholder="e.g., North Indian, South Indian"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input
                    id="servingSize"
                    name="servingSize"
                    placeholder="e.g., 1 person, 2-3 persons"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealTypes">Meal Types (comma-separated)</Label>
                <Input
                  id="mealTypes"
                  name="mealTypes"
                  placeholder="e.g., Breakfast, Lunch, Dinner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietaryOptions">Dietary Options (comma-separated)</Label>
                <Input
                  id="dietaryOptions"
                  name="dietaryOptions"
                  placeholder="e.g., Vegetarian, Vegan, Jain"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="deliveryAvailable" name="deliveryAvailable" />
                  <Label htmlFor="deliveryAvailable">Delivery Available</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {category === "TRAVEL" && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Travel Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Input
                    id="vehicleType"
                    name="vehicleType"
                    placeholder="e.g., Bus, Car, SUV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                  <Input
                    id="seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    placeholder="4"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <Input
                    id="pickupLocation"
                    name="pickupLocation"
                    placeholder="e.g., Delhi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropLocation">Drop Location</Label>
                  <Input
                    id="dropLocation"
                    name="dropLocation"
                    placeholder="e.g., Mumbai"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="acAvailable" name="acAvailable" />
                  <Label htmlFor="acAvailable">AC Available</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="fuelIncluded" name="fuelIncluded" />
                  <Label htmlFor="fuelIncluded">Fuel Included</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="driverIncluded" name="driverIncluded" defaultChecked />
                  <Label htmlFor="driverIncluded">Driver Included</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {category === "LAUNDRY" && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Laundry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceTypes">Service Types (comma-separated)</Label>
                <Input
                  id="serviceTypes"
                  name="serviceTypes"
                  placeholder="e.g., Wash, Iron, Dry Clean"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Kg (₹)</Label>
                  <Input
                    id="pricePerKg"
                    name="pricePerKg"
                    type="number"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerPiece">Price per Piece (₹)</Label>
                  <Input
                    id="pricePerPiece"
                    name="pricePerPiece"
                    type="number"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="expressAvailable" name="expressAvailable" />
                  <Label htmlFor="expressAvailable">Express Service</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="pickupAvailable" name="pickupAvailable" defaultChecked />
                  <Label htmlFor="pickupAvailable">Pickup</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="laundryDeliveryAvailable" name="laundryDeliveryAvailable" defaultChecked />
                  <Label htmlFor="laundryDeliveryAvailable">Delivery</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/provider/services">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Service
          </Button>
        </div>
      </form>
    </div>
  );
}
