"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { api, AdminStats, User, Provider } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Building2, Package, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [statsData, usersData, providersData] = await Promise.all([
        api.admin.statistics(),
        api.admin.users(),
        api.admin.providers(),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setProviders(providersData.providers);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyProvider = async (id: string, isVerified: boolean) => {
    try {
      await api.admin.verifyProvider(id, isVerified);
      toast.success(isVerified ? "Provider verified" : "Verification removed");
      loadData();
    } catch (error) {
      toast.error("Failed to update provider");
      console.error(error);
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.admin.updateRole(id, role);
      toast.success("Role updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  if (authLoading || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.overview.totalUsers || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Providers
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.overview.verifiedProviders || 0}/{stats?.overview.totalProviders || 0}
                </p>
                <p className="text-xs text-muted-foreground">verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Services
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stats?.overview.activeServices || 0}/{stats?.overview.totalServices || 0}
                </p>
                <p className="text-xs text-muted-foreground">active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${stats?.overview.totalRevenue.toFixed(2) || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="recent">Recent Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Name</th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Role</th>
                          <th className="text-left p-4 font-medium">Joined</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b last:border-0">
                            <td className="p-4">{u.name}</td>
                            <td className="p-4 text-muted-foreground">{u.email}</td>
                            <td className="p-4">
                              <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              {u.id !== user?.id && (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="text-sm border rounded px-2 py-1"
                                >
                                  <option value="USER">User</option>
                                  <option value="SERVICE_PROVIDER">Provider</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="providers" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Business</th>
                          <th className="text-left p-4 font-medium">Owner</th>
                          <th className="text-left p-4 font-medium">Services</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providers.map((p) => (
                          <tr key={p.id} className="border-b last:border-0">
                            <td className="p-4 font-medium">{p.businessName}</td>
                            <td className="p-4">
                              <div>
                                <p>{p.user.name}</p>
                                <p className="text-sm text-muted-foreground">{p.user.email}</p>
                              </div>
                            </td>
                            <td className="p-4">{p._count.services}</td>
                            <td className="p-4">
                              {p.isVerified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unverified
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <Button
                                size="sm"
                                variant={p.isVerified ? "outline" : "default"}
                                onClick={() => handleVerifyProvider(p.id, !p.isVerified)}
                              >
                                {p.isVerified ? "Remove Verification" : "Verify"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Customer</th>
                          <th className="text-left p-4 font-medium">Service</th>
                          <th className="text-left p-4 font-medium">Amount</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentBookings.map((b) => (
                          <tr key={b.id} className="border-b last:border-0">
                            <td className="p-4">{b.user.name}</td>
                            <td className="p-4">{b.service.title}</td>
                            <td className="p-4 font-medium">${b.totalPrice}</td>
                            <td className="p-4">
                              <Badge
                                className={
                                  b.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-800"
                                    : b.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {b.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
