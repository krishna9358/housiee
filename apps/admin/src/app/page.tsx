"use client";

import { Card, CardBody, Chip } from "@nextui-org/react";
import { Home, Calendar, Users, Clock } from "lucide-react";
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

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    const res = await api.get<Stats>("/admin/listings/stats");
    if (res.success && res.data) setStats(res.data);
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and management</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardBody className="p-6">
              <Home className="w-8 h-8 mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400">Total Listings</p>
            </CardBody>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardBody className="p-6">
              <Clock className="w-8 h-8 mb-2 text-amber-400" />
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
              <p className="text-slate-400">Pending Review</p>
            </CardBody>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardBody className="p-6">
              <Calendar className="w-8 h-8 mb-2 text-emerald-400" />
              <p className="text-3xl font-bold text-white">{stats.approved}</p>
              <p className="text-slate-400">Approved</p>
            </CardBody>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardBody className="p-6">
              <Users className="w-8 h-8 mb-2 text-red-400" />
              <p className="text-3xl font-bold text-white">{stats.rejected}</p>
              <p className="text-slate-400">Rejected</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card as={Link} href="/listings/pending" className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
            <CardBody className="p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Pending Listings</h3>
                <Chip color="warning" variant="flat">{stats.pending} awaiting</Chip>
              </div>
              <p className="text-slate-400 mt-2">Review and approve provider listings</p>
            </CardBody>
          </Card>

          <Card as={Link} href="/listings" className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
            <CardBody className="p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">All Listings</h3>
                <Chip color="primary" variant="flat">{stats.total} total</Chip>
              </div>
              <p className="text-slate-400 mt-2">View and manage all platform listings</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
