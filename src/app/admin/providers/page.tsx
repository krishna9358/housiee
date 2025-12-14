"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { api, Provider, Pagination } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function AdminProvidersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      loadProviders();
    }
  }, [isAuthenticated, user]);

  const loadProviders = async (params: Record<string, string> = {}) => {
    try {
      setIsLoading(true);
      const data = await api.admin.providers(params);
      setProviders(data.providers);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load providers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await api.admin.verifyProvider(id, isVerified);
      toast.success(isVerified ? "Provider verified" : "Verification removed");
      loadProviders();
    } catch (error) {
      toast.error("Failed to update provider");
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
          Manage Providers
        </motion.h1>
        <p className="text-muted-foreground text-sm">
          Verify and manage service providers
        </p>
      </div>

      {/* Providers Table */}
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
                    <TableHead className="text-xs">Business Name</TableHead>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs">Services</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Joined</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">
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
                          {p._count.services} services
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
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={p.isVerified ? "outline" : "default"}
                          onClick={() => handleVerify(p.id, !p.isVerified)}
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
              onClick={() => loadProviders({ page: page.toString() })}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

