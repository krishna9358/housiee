"use client";

import { ReactNode, useEffect, useState } from "react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
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
  PanelLeft,
  Bell,
  Search,
  Plane,
  Utensils,
  Shirt,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { setCommandPaletteOpen } from "@/lib/store/slices/uiSlice";

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
    icon: <BarChart3 className="h-5 w-5" />,
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
    title: "Service Templates",
    href: "/admin/templates",
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
    color: "bg-secondary text-secondary-foreground",
    icon: <User className="h-4 w-4" />,
  },
  SERVICE_PROVIDER: {
    label: "Provider",
    color: "bg-secondary text-secondary-foreground",
    icon: <Building2 className="h-4 w-4" />,
  },
  ADMIN: {
    label: "Admin",
    color: "bg-primary text-primary-foreground",
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
  const [hasProviderProfile, setHasProviderProfile] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=" + pathname);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Check for provider profile
  useEffect(() => {
    const checkProfile = async () => {
      if (activeRole === "SERVICE_PROVIDER") {
        try {
          await api.provider.profile();
          setHasProviderProfile(true);
        } catch {
          setHasProviderProfile(false);
        }
      }
    };
    checkProfile();
  }, [activeRole]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        dispatch(setSidebarOpen(false));
      } else {
        dispatch(setSidebarOpen(true));
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
    if (role === "ADMIN") router.push("/admin");
    else if (role === "SERVICE_PROVIDER") router.push("/provider");
    else router.push("/dashboard");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!activeRole) return false;
    if (activeRole === "SERVICE_PROVIDER") {
      // If user is provider but has no profile, only show Dashboard (which redirects to create)
      if (!hasProviderProfile && item.href !== "/provider" && item.roles.includes("SERVICE_PROVIDER")) {
        return false;
      }
      return (
        item.roles.includes("SERVICE_PROVIDER") || item.roles.includes("USER")
      );
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Top Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "fixed top-0 right-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
            sidebarOpen ? "left-64" : "left-16"
          )}
        >
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => dispatch(toggleSidebar())}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-2 text-muted-foreground h-9 px-3"
                onClick={() => dispatch(setCommandPaletteOpen(true))}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search...</span>
                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-9 px-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
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
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.header>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 256 : 64 }}
          className={cn(
            "fixed left-0 top-0 z-50 h-screen border-r bg-sidebar",
            "flex flex-col"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-sm">H</span>
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
              className="h-8 w-8 hidden lg:flex"
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
                      "w-full justify-start gap-2 h-10",
                      roleConfig[activeRole || "USER"].color,
                      !sidebarOpen && "justify-center px-0"
                    )}
                  >
                    {roleConfig[activeRole || "USER"].icon}
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left font-medium text-sm">
                          {roleConfig[activeRole || "USER"].label}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs">Switch View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableRoles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={cn(
                        "cursor-pointer gap-2",
                        activeRole === role && "bg-accent"
                      )}
                    >
                      {roleConfig[role].icon}
                      <span>{roleConfig[role].label}</span>
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
                      "w-full gap-2",
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
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          !sidebarOpen && "justify-center px-0"
                        )}
                      >
                        {item.icon}
                        {sidebarOpen && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
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
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={cn(
                "w-full justify-start gap-2 text-muted-foreground hover:text-destructive h-10",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span>Sign out</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main
          className={cn(
            "min-h-screen pt-16 transition-all duration-300",
            sidebarOpen ? "pl-64" : "pl-16"
          )}
        >
          <div className="p-6 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
