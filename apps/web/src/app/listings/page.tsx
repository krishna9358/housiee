"use client";

import { Button, Card, CardBody, CardFooter, Input, Select, SelectItem, Chip, Pagination } from "@nextui-org/react";
import { Search, MapPin, Star, Filter } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  city: string;
  price: number;
  priceUnit: string;
  images: string[];
  avgRating: number | null;
  reviewCount: number;
}

const categories = [
  { key: "", label: "All Categories" },
  { key: "ACCOMMODATION", label: "Accommodation" },
  { key: "TRAVEL", label: "Travel" },
  { key: "FOOD", label: "Food" },
  { key: "LAUNDRY", label: "Laundry" },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState("");

  useEffect(() => {
    fetchListings();
  }, [page, category, search, city]);

  const fetchListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (city) params.set("city", city);

    const res = await api.get<{ items: Listing[]; total: number }>(`/listings?${params}`);
    if (res.success && res.data) {
      setListings(res.data.items);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startContent={<Search className="w-5 h-5 text-slate-400" />}
              className="flex-1"
            />
            <Select
              placeholder="Category"
              selectedKeys={category ? [category] : []}
              onSelectionChange={(keys) => setCategory(Array.from(keys)[0] as string || "")}
              className="w-full md:w-48"
            >
              {categories.map((cat) => (
                <SelectItem key={cat.key}>{cat.label}</SelectItem>
              ))}
            </Select>
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              startContent={<MapPin className="w-5 h-5 text-slate-400" />}
              className="w-full md:w-48"
            />
            <Button color="primary" startContent={<Filter className="w-4 h-4" />} onClick={fetchListings}>
              Filter
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {total} Services Found
          </h1>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardBody className="p-0">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
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
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{listing.description}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-2">
                      <MapPin className="w-4 h-4" />
                      {listing.city}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">
                        ₹{listing.price}
                        <span className="text-sm font-normal text-slate-500">/{listing.priceUnit}</span>
                      </span>
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
        )}

        {total > 12 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={Math.ceil(total / 12)}
              page={page}
              onChange={setPage}
              color="primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
