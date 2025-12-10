"use client";

import { Card, CardBody, Button, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  category: string;
  city: string;
  price: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, "warning" | "success" | "danger" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  DRAFT: "default",
};

export default function ProviderListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }
    fetchListings();
  }, [user, router]);

  const fetchListings = async () => {
    setLoading(true);
    const res = await api.get<{ items: Listing[] }>("/provider/listings");
    if (res.success && res.data) {
      setListings(res.data.items);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const res = await api.delete(`/provider/listings/${id}`);
    if (res.success) fetchListings();
  };

  if (!user || user.role !== "PROVIDER") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
          <Button as={Link} href="/listings/new" color="primary" startContent={<Plus className="w-4 h-4" />}>
            Add Listing
          </Button>
        </div>

        <Card>
          <CardBody className="p-0">
            <Table aria-label="Listings table">
              <TableHeader>
                <TableColumn>TITLE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>CITY</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No listings found">
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.title}</TableCell>
                    <TableCell>{listing.category}</TableCell>
                    <TableCell>{listing.city}</TableCell>
                    <TableCell>₹{listing.price}</TableCell>
                    <TableCell>
                      <Chip size="sm" color={statusColors[listing.status]} variant="flat">
                        {listing.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="light" as={Link} href={`/listings/${listing.id}/edit`} isIconOnly>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="light" color="danger" onClick={() => handleDelete(listing.id)} isIconOnly>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
