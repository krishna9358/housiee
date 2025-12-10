"use client";

import { Card, CardBody, Chip, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Select, SelectItem } from "@nextui-org/react";
import { Check, X } from "lucide-react";
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

export default function AllListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetchListings();
  }, [user, router, page, status, category]);

  const fetchListings = async () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "10");
    if (status) params.set("status", status);
    if (category) params.set("category", category);

    const res = await api.get<{ items: Listing[]; total: number }>(`/admin/listings/all?${params}`);
    if (res.success && res.data) {
      setListings(res.data.items);
      setTotal(res.data.total);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const res = await api.post(`/admin/listings/${id}/${action}`, {});
    if (res.success) fetchListings();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">All Listings</h1>

        <div className="flex gap-4 mb-6">
          <Select
            placeholder="Filter by status"
            className="w-48"
            classNames={{ trigger: "bg-slate-800 border-slate-700" }}
            selectedKeys={status ? [status] : []}
            onSelectionChange={(keys) => setStatus(Array.from(keys)[0] as string || "")}
          >
            <SelectItem key="">All Status</SelectItem>
            <SelectItem key="PENDING">Pending</SelectItem>
            <SelectItem key="APPROVED">Approved</SelectItem>
            <SelectItem key="REJECTED">Rejected</SelectItem>
          </Select>
          <Select
            placeholder="Filter by category"
            className="w-48"
            classNames={{ trigger: "bg-slate-800 border-slate-700" }}
            selectedKeys={category ? [category] : []}
            onSelectionChange={(keys) => setCategory(Array.from(keys)[0] as string || "")}
          >
            <SelectItem key="">All Categories</SelectItem>
            <SelectItem key="ACCOMMODATION">Accommodation</SelectItem>
            <SelectItem key="TRAVEL">Travel</SelectItem>
            <SelectItem key="FOOD">Food</SelectItem>
            <SelectItem key="LAUNDRY">Laundry</SelectItem>
          </Select>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardBody className="p-0">
            <Table aria-label="All listings" classNames={{ wrapper: "bg-slate-800" }}>
              <TableHeader>
                <TableColumn className="bg-slate-700 text-slate-300">TITLE</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">CATEGORY</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">CITY</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">PRICE</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">STATUS</TableColumn>
                <TableColumn className="bg-slate-700 text-slate-300">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No listings found">
                {listings.map((listing) => (
                  <TableRow key={listing.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{listing.title}</TableCell>
                    <TableCell><Chip size="sm" variant="flat" color="primary">{listing.category}</Chip></TableCell>
                    <TableCell className="text-slate-300">{listing.city}</TableCell>
                    <TableCell className="text-emerald-400 font-semibold">₹{listing.price}</TableCell>
                    <TableCell><Chip size="sm" color={statusColors[listing.status]} variant="flat">{listing.status}</Chip></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {listing.status === "PENDING" && (
                          <>
                            <Button size="sm" color="success" variant="flat" onClick={() => handleAction(listing.id, "approve")} isIconOnly>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onClick={() => handleAction(listing.id, "reject")} isIconOnly>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
