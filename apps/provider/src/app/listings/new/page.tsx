"use client";

import { Card, CardBody, Button, Input, Textarea, Select, SelectItem } from "@nextui-org/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const categories = [
  { key: "ACCOMMODATION", label: "Accommodation" },
  { key: "TRAVEL", label: "Travel" },
  { key: "FOOD", label: "Food" },
  { key: "LAUNDRY", label: "Laundry" },
];

export default function NewListingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    city: "",
    state: "",
    street: "",
    price: "",
    priceUnit: "per night",
    amenities: "",
    images: "",
  });

  useEffect(() => {
    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await api.post("/provider/listings", {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      address: {
        city: formData.city,
        state: formData.state,
        street: formData.street,
      },
      price: parseFloat(formData.price),
      priceUnit: formData.priceUnit,
      amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      images: formData.images.split(",").map((a) => a.trim()).filter(Boolean),
    });

    if (res.success) {
      router.push("/listings");
    } else {
      alert(res.error || "Failed to create listing");
    }
    setLoading(false);
  };

  if (!user || user.role !== "PROVIDER") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button as={Link} href="/listings" variant="light" startContent={<ArrowLeft className="w-4 h-4" />} className="mb-6">
          Back to Listings
        </Button>

        <Card>
          <CardBody className="p-8">
            <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Title"
                placeholder="Enter listing title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />

              <Textarea
                label="Description"
                placeholder="Describe your service"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minRows={4}
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={formData.category ? [formData.category] : []}
                  onSelectionChange={(keys) => setFormData({ ...formData, category: Array.from(keys)[0] as string })}
                  isRequired
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.key}>{cat.label}</SelectItem>
                  ))}
                </Select>

                <Input
                  label="Type"
                  placeholder="e.g., Hostel, Flat, Cab"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  isRequired
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  isRequired
                />
                <Input
                  label="State"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  isRequired
                />
              </div>

              <Input
                label="Street Address"
                placeholder="Enter street address"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Price (₹)"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  isRequired
                />
                <Input
                  label="Price Unit"
                  placeholder="e.g., per night, per kg"
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                />
              </div>

              <Input
                label="Amenities"
                placeholder="WiFi, AC, Parking (comma separated)"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              />

              <Input
                label="Image URLs"
                placeholder="https://... (comma separated)"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              />

              <Button type="submit" color="primary" size="lg" fullWidth isLoading={loading}>
                Create Listing
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
