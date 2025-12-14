"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useAppDispatch, useAppSelector } from "./providers";
import { signOut } from "@/lib/auth-client";
import { setCommandPaletteOpen, setMobileMenuOpen } from "@/lib/store/slices/uiSlice";
import { switchRole, UserRole } from "@/lib/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  Search,
  Building2,
  Shield,
  Calendar,
  ChevronDown,
  Plus,
  Settings,
  Plane,
  Utensils,
  Home,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const roleConfig: Record<
  UserRole,
  { label: string; color: string; icon: React.ReactNode; dashboard: string }
> = {
  USER: {
    label: "Customer",
    color: "bg-secondary text-secondary-foreground",
    icon: <User className="h-3 w-3" />,
    dashboard: "/dashboard",
  },
  SERVICE_PROVIDER: {
    label: "Provider",
    color: "bg-secondary text-secondary-foreground",
    icon: <Building2 className="h-3 w-3" />,
    dashboard: "/provider",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-primary text-primary-foreground",
    icon: <Shield className="h-3 w-3" />,
    dashboard: "/admin",
  },
};

const serviceCategories = [
  { name: "Travel", icon: Plane, href: "/services?category=TRAVEL", color: "text-blue-600 dark:text-blue-400" },
  { name: "Food", icon: Utensils, href: "/services?category=FOOD", color: "text-orange-600 dark:text-orange-400" },
  { name: "Accommodation", icon: Home, href: "/services?category=ACCOMMODATION", color: "text-green-600 dark:text-green-400" },
  { name: "Laundry", icon: Shirt, href: "/services?category=LAUNDRY", color: "text-purple-600 dark:text-purple-400" },
];

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { mobileMenuOpen } = useAppSelector((state) => state.ui);
  const { activeRole } = useAppSelector((state) => state.user);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const openCommandPalette = () => {
    dispatch(setCommandPaletteOpen(true));
  };

  const handleRoleSwitch = (role: UserRole) => {
    dispatch(switchRole(role));
    router.push(roleConfig[role].dashboard);
  };

  const availableRoles: UserRole[] = user
    ? user.role === "ADMIN"
      ? ["USER", "SERVICE_PROVIDER", "ADMIN"]
      : user.role === "SERVICE_PROVIDER"
        ? ["USER", "SERVICE_PROVIDER"]
        : ["USER"]
    : [];

  // Check if we're on a dashboard page
  const isDashboardPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/admin");

  // Don't show navbar on dashboard pages (they have sidebar)
  if (isDashboardPage) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Housiee
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                Services
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/services" className="w-full cursor-pointer">
                  All Services
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {serviceCategories.map((cat) => (
                <DropdownMenuItem key={cat.name} asChild>
                  <Link href={cat.href} className="w-full cursor-pointer gap-2">
                    <cat.icon className={cn("h-4 w-4", cat.color)} />
                    {cat.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isAuthenticated && (
            <Button variant="ghost" asChild>
              <Link href="/become-provider">Become a Provider</Link>
            </Button>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 h-9"
            onClick={openCommandPalette}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
            <Kbd className="ml-2">⌘K</Kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={openCommandPalette}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse bg-muted rounded-lg" />
          ) : isAuthenticated && user ? (
            <>
              {/* Role Switcher */}
              {availableRoles.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "hidden sm:flex gap-1.5 h-8 px-2.5",
                        roleConfig[activeRole || user.role].color
                      )}
                    >
                      {roleConfig[activeRole || user.role].icon}
                      <span className="text-xs font-medium">
                        {roleConfig[activeRole || user.role].label}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Switch View
                    </DropdownMenuLabel>
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
              )}

              {/* Quick Add for Provider */}
              {(activeRole === "SERVICE_PROVIDER" ||
                user.role === "SERVICE_PROVIDER") && (
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="hidden md:flex gap-1.5 h-8"
                >
                  <Link href="/provider/services/new">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Service</span>
                  </Link>
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 h-9 px-2"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href={roleConfig[activeRole || user.role].dashboard}
                      className="cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login?tab=register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet
            open={mobileMenuOpen}
            onOpenChange={(open) => dispatch(setMobileMenuOpen(open))}
          >
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">H</span>
                  </div>
                  Housiee
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
                    Services
                  </p>
                  {serviceCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                    >
                      <cat.icon className={cn("h-5 w-5", cat.color)} />
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border" />

                {!isAuthenticated ? (
                  <div className="space-y-2 pt-2">
                    <Button asChild className="w-full">
                      <Link
                        href="/login?tab=register"
                        onClick={() => dispatch(setMobileMenuOpen(false))}
                      >
                        Get Started
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link
                        href="/login"
                        onClick={() => dispatch(setMobileMenuOpen(false))}
                      >
                        Sign in
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href={roleConfig[activeRole || user!.role].dashboard}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                    >
                      <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        dispatch(setMobileMenuOpen(false));
                        handleSignOut();
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
