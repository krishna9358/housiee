"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { switchRole, UserRole } from "@/lib/store/slices/userSlice";
import { toggleSidebar, setSidebarOpen } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingBag,
  Building2,
  Shield,
  TrendingUp,
  Star,
  Plus,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // User items
  {
    title: "My Bookings",
    href: "/dashboard",
    icon: <Calendar className="h-5 w-5" />,
    roles: ["USER", "SERVICE_PROVIDER", "ADMIN"],
  },
  {
    title: "Browse Services",
    href: "/services",
    icon: <ShoppingBag className="h-5 w-5" />,
    roles: ["USER", "SERVICE_PROVIDER", "ADMIN"],
  },
  // Provider items
  {
    title: "Provider Dashboard",
    href: "/provider",
    icon: <TrendingUp className="h-5 w-5" />,
    roles: ["SERVICE_PROVIDER"],
  },
  {
    title: "My Services",
    href: "/provider/services",
    icon: <Package className="h-5 w-5" />,
    roles: ["SERVICE_PROVIDER"],
  },
  {
    title: "Provider Bookings",
    href: "/provider/bookings",
    icon: <Calendar className="h-5 w-5" />,
    roles: ["SERVICE_PROVIDER"],
  },
  {
    title: "Reviews",
    href: "/provider/reviews",
    icon: <Star className="h-5 w-5" />,
    roles: ["SERVICE_PROVIDER"],
  },
  // Admin items
  {
    title: "Admin Overview",
    href: "/admin",
    icon: <Shield className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Providers",
    href: "/admin/providers",
    icon: <Building2 className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "All Services",
    href: "/admin/services",
    icon: <Package className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
];

const roleConfig: Record<
  UserRole,
  { label: string; color: string; icon: ReactNode }
> = {
  USER: {
    label: "Customer",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: <User className="h-4 w-4" />,
  },
  SERVICE_PROVIDER: {
    label: "Provider",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: <Building2 className="h-4 w-4" />,
  },
  ADMIN: {
    label: "Admin",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: <Shield className="h-4 w-4" />,
  },
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { activeRole } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=" + pathname);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        dispatch(setSidebarOpen(false));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const handleRoleSwitch = (role: UserRole) => {
    dispatch(switchRole(role));
    // Navigate to appropriate dashboard
    if (role === "ADMIN") router.push("/admin");
    else if (role === "SERVICE_PROVIDER") router.push("/provider");
    else router.push("/dashboard");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!activeRole) return false;
    // For providers, show both user and provider items
    if (activeRole === "SERVICE_PROVIDER") {
      return (
        item.roles.includes("SERVICE_PROVIDER") || item.roles.includes("USER")
      );
    }
    // For admins, show all items
    if (activeRole === "ADMIN") {
      return true;
    }
    return item.roles.includes(activeRole);
  });

  const availableRoles: UserRole[] = user
    ? user.role === "ADMIN"
      ? ["USER", "SERVICE_PROVIDER", "ADMIN"]
      : user.role === "SERVICE_PROVIDER"
        ? ["USER", "SERVICE_PROVIDER"]
        : ["USER"]
    : [];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 72 }}
          className={cn(
            "fixed left-0 top-0 z-40 h-screen border-r bg-white/80 backdrop-blur-xl",
            "flex flex-col transition-shadow duration-300",
            sidebarOpen ? "shadow-xl" : "shadow-md"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-lg tracking-tight"
                  >
                    Housiee
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleSidebar())}
              className="h-8 w-8 hover:bg-primary/5"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Role Switcher */}
          {availableRoles.length > 1 && (
            <div className="p-3 border-b">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start gap-3 h-12",
                      roleConfig[activeRole || "USER"].color,
                      !sidebarOpen && "justify-center px-0"
                    )}
                  >
                    {roleConfig[activeRole || "USER"].icon}
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left font-medium">
                          {roleConfig[activeRole || "USER"].label}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Switch View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableRoles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={cn(
                        "cursor-pointer",
                        activeRole === role && "bg-primary/5"
                      )}
                    >
                      {roleConfig[role].icon}
                      <span className="ml-2">{roleConfig[role].label}</span>
                      {activeRole === role && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs"
                        >
                          Active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Quick Action */}
          {activeRole === "SERVICE_PROVIDER" && (
            <div className="p-3 border-b">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    className={cn(
                      "w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25",
                      !sidebarOpen && "px-0"
                    )}
                  >
                    <Link href="/provider/services/new">
                      <Plus className="h-4 w-4" />
                      {sidebarOpen && <span>Add Service</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">Add Service</TooltipContent>
                )}
              </Tooltip>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                          !sidebarOpen && "justify-center px-0"
                        )}
                      >
                        {item.icon}
                        {sidebarOpen && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="ml-auto text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {!sidebarOpen && (
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />

          {/* User Profile */}
          <div className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    !sidebarOpen && "justify-center px-0"
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main
          className={cn(
            "min-h-screen transition-all duration-300",
            sidebarOpen ? "pl-[280px]" : "pl-[72px]"
          )}
        >
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}

