"use client";

import { Card, CardBody, Button } from "@nextui-org/react";
import { Calendar, Star, Home } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}!</h1>
          <p className="text-slate-500 mt-1">Manage your bookings and account</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card as={Link} href="/dashboard/bookings" className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">My Bookings</h3>
              <p className="text-slate-500 mt-1">View and manage your service bookings</p>
            </CardBody>
          </Card>

          <Card as={Link} href="/listings" className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Browse Services</h3>
              <p className="text-slate-500 mt-1">Explore accommodation, travel, food & more</p>
            </CardBody>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">My Reviews</h3>
              <p className="text-slate-500 mt-1">Leave reviews for completed bookings</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
