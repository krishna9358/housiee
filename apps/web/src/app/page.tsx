"use client";

import { Button, Card, CardBody, CardFooter, Input, Chip } from "@nextui-org/react";
import { Search, Home, Car, UtensilsCrossed, Shirt, Star, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const categories = [
  { id: "ACCOMMODATION", name: "Accommodation", icon: Home, color: "bg-blue-500", description: "Hostels, PGs, Flats & more" },
  { id: "TRAVEL", name: "Travel", icon: Car, color: "bg-emerald-500", description: "Cabs, bikes & transport" },
  { id: "FOOD", name: "Food", icon: UtensilsCrossed, color: "bg-orange-500", description: "Tiffin, mess & catering" },
  { id: "LAUNDRY", name: "Laundry", icon: Shirt, color: "bg-purple-500", description: "Wash, iron & dry clean" },
];

interface Listing {
  id: string;
  title: string;
  category: string;
  city: string;
  price: number;
  priceUnit: string;
  images: string[];
  avgRating: number | null;
  reviewCount: number;
}

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.get("/listings/featured").then((res) => {
      if (res.success) setFeaturedListings(res.data || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-60" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-6">
              Find Local Services
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Discover trusted accommodation, travel, food, and laundry services in your area
            </p>
            <div className="max-w-xl mx-auto flex gap-2">
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-5 h-5 text-slate-400" />}
                size="lg"
                classNames={{
                  input: "text-lg",
                  inputWrapper: "bg-white shadow-lg border-0",
                }}
              />
              <Button
                as={Link}
                href={`/listings?search=${searchQuery}`}
                color="primary"
                size="lg"
                className="px-8 font-semibold"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/listings?category=${cat.id}`}>
                <Card className="hover:scale-105 transition-transform cursor-pointer border-0 shadow-md">
                  <CardBody className="p-6 text-center">
                    <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <cat.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{cat.description}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Featured Services</h2>
            <Button as={Link} href="/listings" variant="light" color="primary" endContent={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="border-0 shadow-md hover:shadow-xl transition-shadow">
                <CardBody className="p-0">
                  <div className="relative h-48 bg-slate-200">
                    <img
                      src={listing.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <Chip size="sm" className="absolute top-3 left-3 bg-white/90 text-slate-700 font-medium">
                      {listing.category}
                    </Chip>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      {listing.city}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">₹{listing.price}<span className="text-sm font-normal text-slate-500">/{listing.priceUnit}</span></span>
                      {listing.avgRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {listing.avgRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="pt-0 px-4 pb-4">
                  <Button as={Link} href={`/listings/${listing.id}`} color="primary" variant="flat" fullWidth>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">ServiceHub</h3>
          <p className="text-slate-400">Your trusted local services marketplace</p>
        </div>
      </footer>
    </div>
  );
}
