"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { api, AdminStats, User, Provider } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  Building2,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  CONFIRMED: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  CANCELLED: { color: "text-red-600", bg: "bg-red-50 border-red-200" },
  COMPLETED: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl font-bold mb-2"
        >
          Admin Dashboard
        </motion.h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Users",
                value: stats?.overview.totalUsers || 0,
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Providers",
                value: `${stats?.overview.verifiedProviders || 0}/${stats?.overview.totalProviders || 0}`,
                subtitle: "verified",
                icon: Building2,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                title: "Services",
                value: `${stats?.overview.activeServices || 0}/${stats?.overview.totalServices || 0}`,
                subtitle: "active",
                icon: Package,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                title: "Total Revenue",
                value: `$${stats?.overview.totalRevenue.toFixed(2) || "0.00"}`,
                icon: DollarSign,
                color: "text-amber-600",
                bg: "bg-amber-50",
                trend: "+15%",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.subtitle && (
                          <p className="text-xs text-muted-foreground">
                            {stat.subtitle}
                          </p>
                        )}
                        {stat.trend && (
                          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {stat.trend} this month
                          </p>
                        )}
                      </div>
                      <div
                        className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center`}
                      >
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <Card className="border-0 shadow-lg">
            <Tabs defaultValue="users" className="w-full">
              <CardHeader className="border-b bg-muted/30 pb-0">
                <TabsList className="w-full justify-start bg-transparent gap-4 h-auto p-0">
                  <TabsTrigger
                    value="users"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                  >
                    Users ({users.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="providers"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                  >
                    Providers ({providers.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                  >
                    Recent Bookings
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-0">
                <TabsContent value="users" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {u.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {u.email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  u.role === "ADMIN" ? "default" : "secondary"
                                }
                                className={
                                  u.role === "ADMIN"
                                    ? "bg-purple-500"
                                    : u.role === "SERVICE_PROVIDER"
                                      ? "bg-emerald-500 text-white"
                                      : ""
                                }
                              >
                                {u.role === "SERVICE_PROVIDER"
                                  ? "Provider"
                                  : u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {u.id !== user?.id && (
                                <Select
                                  value={u.role}
                                  onValueChange={(value) =>
                                    handleRoleChange(u.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="SERVICE_PROVIDER">
                                      Provider
                                    </SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="providers" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Business</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {providers.map((p) => (
                          <TableRow key={p.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {p.businessName}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{p.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {p.user.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {p._count.services} services
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {p.isVerified ? (
                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-muted-foreground gap-1"
                                >
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={p.isVerified ? "outline" : "default"}
                                onClick={() =>
                                  handleVerifyProvider(p.id, !p.isVerified)
                                }
                                className={
                                  !p.isVerified ? "shadow-md" : undefined
                                }
                              >
                                {p.isVerified ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Revoke
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.recentBookings.map((b) => (
                          <TableRow key={b.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {b.user.name}
                            </TableCell>
                            <TableCell>{b.service.title}</TableCell>
                            <TableCell className="font-semibold">
                              ${b.totalPrice}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${statusConfig[b.status]?.bg} ${statusConfig[b.status]?.color} border`}
                              >
                                {b.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}
