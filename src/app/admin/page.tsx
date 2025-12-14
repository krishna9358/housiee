"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { api, AdminStats, User, Provider } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  CONFIRMED: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  CANCELLED: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  COMPLETED: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];

function StatsCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[240px] w-full" />
      </CardContent>
    </Card>
  );
}

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Prepare chart data from real stats
  const categoryData = stats?.servicesByCategory?.map((item) => ({
    name: item.category,
    value: item.count,
  })) || [];

  const bookingsStatusData = stats?.bookingsByStatus
    ? Object.entries(stats.bookingsByStatus).map(([status, count]) => ({
        status,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            Admin Dashboard
          </motion.h1>
          <p className="text-muted-foreground text-sm">
            Platform overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/templates">
              <Plus className="h-4 w-4 mr-2" />
              Add Service Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            {[
              {
                title: "Total Users",
                value: formatNumber(stats?.overview.totalUsers || 0),
                icon: Users,
              },
              {
                title: "Providers",
                value: `${stats?.overview.verifiedProviders || 0}/${stats?.overview.totalProviders || 0}`,
                subtitle: "verified",
                icon: Building2,
              },
              {
                title: "Services",
                value: `${stats?.overview.activeServices || 0}/${stats?.overview.totalServices || 0}`,
                subtitle: "active",
                icon: Package,
              },
              {
                title: "Total Revenue",
                value: formatCurrency(stats?.overview.totalRevenue || 0),
                icon: IndianRupee,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-xl font-bold mt-1">{stat.value}</p>
                        {stat.subtitle && (
                          <p className="text-xs text-muted-foreground">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Bookings by Status Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Bookings by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                {bookingsStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsStatusData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="status" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No booking data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Pie Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Services by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No service data available
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Service</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentBookings?.length ? (
                  stats.recentBookings.slice(0, 5).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-sm">{b.user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {b.service.title}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(b.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusConfig[b.status]?.bg} ${statusConfig[b.status]?.color}`}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No recent bookings
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Card className="border-0 shadow-sm">
        <Tabs defaultValue="users">
          <CardHeader className="border-b pb-0">
            <TabsList className="w-full justify-start bg-transparent gap-4 h-auto p-0">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger
                value="providers"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm"
              >
                Providers ({providers.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-0">
            <TabsContent value="users" className="mt-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Joined</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="text-sm font-medium">
                            {u.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "ADMIN" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {u.role === "SERVICE_PROVIDER" ? "Provider" : u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(u.createdAt)}
                          </TableCell>
                          <TableCell>
                            {u.id !== user?.id && (
                              <Select
                                value={u.role}
                                onValueChange={(value) =>
                                  handleRoleChange(u.id, value)
                                }
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
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
              )}
            </TabsContent>

            <TabsContent value="providers" className="mt-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">Business</TableHead>
                        <TableHead className="text-xs">Owner</TableHead>
                        <TableHead className="text-xs">Services</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {providers.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm font-medium">
                            {p.businessName}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{p.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {p._count.services}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.isVerified ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs gap-1">
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
                              className="h-7 text-xs"
                            >
                              {p.isVerified ? (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Revoke
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
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
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
