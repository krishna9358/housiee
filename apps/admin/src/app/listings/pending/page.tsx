"use client";

import { Card, CardBody, Chip, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from "@nextui-org/react";
import { Check, X, Eye } from "lucide-react";
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
  providerId: string;
  createdAt: string;
}

export default function PendingListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetchListings();
  }, [user, router, page]);

  const fetchListings = async () => {
    setLoading(true);
    const res = await api.get<{ items: Listing[]; total: number }>(`/admin/listings/pending?page=${page}&limit=10`);
    if (res.success && res.data) {
      setListings(res.data.items);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const res = await api.post(`/admin/listings/${id}/approve`, {});
    if (res.success) fetchListings();
  };

  const handleReject = async (id: string) => {
    const res = await api.post(`/admin/listings/${id}/reject`, {});
    if (res.success) fetchListings();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Pending Listings</h1>

        <Card className="bg-slate-800 border-slate-700">
          <CardBody className="p-0">
            <Table aria-label="Pending listings" classNames={{ wrapper: "bg-slate-800" }}>
              <TableHeader>
                <TableColumn className="bg-slate-700 text-slate-300">TITLE</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">CATEGORY</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">CITY</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">PRICE</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">CREATED</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No pending listings">
                {listings.map((listing) => (
                  <TableRow key={listing.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{listing.title}</TableCell>
                    <TableCell><Chip size="sm" variant="flat" color="primary">{listing.category}</Chip></TableCell>
                    <TableCell className="text-slate-300">{listing.city}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">₹{listing.price}</TableCell>
                    <TableCell className="text-slate-400">{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" color="success" variant="flat" onClick={() => handleApprove(listing.id)} startContent={<Check className="w-3 h-3" />}>
                          Approve
                        </Button>
                        <Button size="sm" color="danger" variant="flat" onClick={() => handleReject(listing.id)} startContent={<X className="w-3 h-3" />}>
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {total > 10 && (
          <div className="flex justify-center mt-6">
            <Pagination total={Math.ceil(total / 10)} page={page} onChange={setPage} color="primary" />
          </div>
        )}
      </div>
    </div>
  );
}
