"use client";

import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { Plus, Home, Calendar, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
}

export default function ProviderDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listingStats, setListingStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [bookingStats, setBookingStats] = useState<BookingStats>({ total: 0, pending: 0, confirmed: 0, completed: 0 });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    const [listingRes, bookingRes] = await Promise.all([
      api.get<Stats>("/provider/listings/stats"),
      api.get<BookingStats>("/provider/bookings/stats"),
    ]);
    if (listingRes.success && listingRes.data) setListingStats(listingRes.data);
    if (bookingRes.success && bookingRes.data) setBookingStats(bookingRes.data);
  };

  if (!user || user.role !== "PROVIDER") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your listings and bookings</p>
          </div>
          <Button as={Link} href="/listings/new" color="primary" startContent={<Plus className="w-4 h-4" />}>
            Add Listing
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardBody className="p-6">
              <Home className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{listingStats.total}</p>
              <p className="text-blue-100">Total Listings</p>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardBody className="p-6">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{listingStats.pending}</p>
              <p className="text-amber-100">Pending Approval</p>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardBody className="p-6">
              <Calendar className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{bookingStats.total}</p>
              <p className="text-emerald-100">Total Bookings</p>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardBody className="p-6">
              <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{bookingStats.completed}</p>
              <p className="text-purple-100">Completed</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card as={Link} href="/listings" className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-4">My Listings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved</span>
                  <Chip size="sm" color="success" variant="flat">{listingStats.approved}</Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending</span>
                  <Chip size="sm" color="warning" variant="flat">{listingStats.pending}</Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rejected</span>
                  <Chip size="sm" color="danger" variant="flat">{listingStats.rejected}</Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card as={Link} href="/bookings" className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-4">Bookings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending</span>
                  <Chip size="sm" color="warning" variant="flat">{bookingStats.pending}</Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmed</span>
                  <Chip size="sm" color="primary" variant="flat">{bookingStats.confirmed}</Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed</span>
                  <Chip size="sm" color="success" variant="flat">{bookingStats.completed}</Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
