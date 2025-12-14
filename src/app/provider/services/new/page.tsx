"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

export default function NewServicePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([]);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/provider/services/new");
      } else if (user?.role === "USER") {
        router.push("/become-provider");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities((prev) => [...prev, newAmenity]);
      setNewAmenity("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData();

    formData.append("title", (form.elements.namedItem("title") as HTMLInputElement).value);
    formData.append("description", (form.elements.namedItem("description") as HTMLTextAreaElement).value);
    formData.append("category", category);
    formData.append("basePrice", (form.elements.namedItem("basePrice") as HTMLInputElement).value);

    images.forEach((file) => formData.append("images", file));

    if (category === "ACCOMMODATION") {
      formData.append("propertyType", (form.elements.namedItem("propertyType") as HTMLInputElement).value);
      formData.append("bedrooms", (form.elements.namedItem("bedrooms") as HTMLInputElement).value);
      formData.append("bathrooms", (form.elements.namedItem("bathrooms") as HTMLInputElement).value);
      formData.append("maxGuests", (form.elements.namedItem("maxGuests") as HTMLInputElement).value);
      formData.append("amenities", JSON.stringify(amenities));
      formData.append("checkInTime", (form.elements.namedItem("checkInTime") as HTMLInputElement).value);
      formData.append("checkOutTime", (form.elements.namedItem("checkOutTime") as HTMLInputElement).value);
    } else if (category === "FOOD") {
      formData.append("cuisineType", (form.elements.namedItem("cuisineType") as HTMLInputElement).value);
      formData.append("mealTypes", JSON.stringify(mealTypes));
      formData.append("dietaryOptions", JSON.stringify(dietaryOptions));
      formData.append("servingSize", (form.elements.namedItem("servingSize") as HTMLInputElement).value);
      formData.append("deliveryAvailable", String(deliveryAvailable));
    }

    try {
      const result = await api.services.create(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Service created successfully!");
        router.push("/provider");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create service");
    } finally {
      setIsLoading(false);
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
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-8">Add New Service</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General details about your service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input id="title" name="title" placeholder="e.g., Cozy Beach House" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your service..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                      <SelectItem value="FOOD">Food Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice">Price *</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images (max 5)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map((file, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                {images.length < 5 && (
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {category === "ACCOMMODATION" && (
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Input id="propertyType" name="propertyType" placeholder="e.g., Apartment, Villa, House" required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input id="bedrooms" name="bedrooms" type="number" min="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input id="bathrooms" name="bathrooms" type="number" min="0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Max Guests *</Label>
                    <Input id="maxGuests" name="maxGuests" type="number" min="1" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input id="checkInTime" name="checkInTime" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Check-out Time</Label>
                    <Input id="checkOutTime" name="checkOutTime" type="time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Add amenity"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                    />
                    <Button type="button" variant="outline" onClick={addAmenity}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                      >
                        {amenity}
                        <button type="button" onClick={() => setAmenities(amenities.filter((_, j) => j !== i))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {category === "FOOD" && (
            <Card>
              <CardHeader>
                <CardTitle>Food Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type *</Label>
                  <Input id="cuisineType" name="cuisineType" placeholder="e.g., Italian, Asian, Mediterranean" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input id="servingSize" name="servingSize" placeholder="e.g., 2-4 people" />
                </div>

                <div className="space-y-2">
                  <Label>Meal Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Breakfast", "Lunch", "Dinner", "Snacks", "Catering"].map((meal) => (
                      <label key={meal} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={mealTypes.includes(meal)}
                          onChange={(e) =>
                            setMealTypes(
                              e.target.checked
                                ? [...mealTypes, meal]
                                : mealTypes.filter((m) => m !== meal)
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-sm">{meal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dietary Options</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={dietaryOptions.includes(option)}
                          onChange={(e) =>
                            setDietaryOptions(
                              e.target.checked
                                ? [...dietaryOptions, option]
                                : dietaryOptions.filter((o) => o !== option)
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="deliveryAvailable"
                    checked={deliveryAvailable}
                    onCheckedChange={setDeliveryAvailable}
                  />
                  <Label htmlFor="deliveryAvailable">Delivery Available</Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !category}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
