"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { api, User, Pagination } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Loader2, Search, User as UserIcon, Shield, Building2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      loadUsers();
    }
  }, [isAuthenticated, user]);

  const loadUsers = async (params: Record<string, string> = {}) => {
    try {
      setIsLoading(true);
      const data = await api.admin.users(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers({ search });
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await api.admin.updateRole(id, role);
      toast.success("Role updated");
      loadUsers();
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.admin.deleteUser(id);
      toast.success("User deleted");
      loadUsers();
    } catch (error) {
      toast.error("Failed to delete user");
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

  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          Manage Users
        </motion.h1>
        <p className="text-muted-foreground text-sm">
          View and manage all platform users
        </p>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-sm"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Provider</TableHead>
                    <TableHead className="text-xs">Joined</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {u.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-sm">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === "ADMIN" ? "default" : "secondary"}
                          className="text-xs gap-1"
                        >
                          {u.role === "ADMIN" && <Shield className="h-3 w-3" />}
                          {u.role === "SERVICE_PROVIDER" && <Building2 className="h-3 w-3" />}
                          {u.role === "USER" && <UserIcon className="h-3 w-3" />}
                          {u.role === "SERVICE_PROVIDER" ? "Provider" : u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.serviceProvider ? (
                          <Badge
                            variant={u.serviceProvider.isVerified ? "default" : "outline"}
                            className="text-xs"
                          >
                            {u.serviceProvider.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {u.id !== user?.id && (
                            <>
                              <Select
                                value={u.role}
                                onValueChange={(value) => handleRoleChange(u.id, value)}
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USER">User</SelectItem>
                                  <SelectItem value="SERVICE_PROVIDER">Provider</SelectItem>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive h-8 text-xs"
                                onClick={() => handleDelete(u.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === pagination.page ? "default" : "outline"}
              size="sm"
              onClick={() => loadUsers({ page: page.toString() })}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

