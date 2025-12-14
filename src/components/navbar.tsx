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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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
  Utensils,
  Home,
  Shield,
  TrendingUp,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  Settings,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const roleConfig: Record<
  UserRole,
  { label: string; color: string; icon: React.ReactNode; dashboard: string }
> = {
  USER: {
    label: "Customer",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: <User className="h-3 w-3" />,
    dashboard: "/dashboard",
  },
  SERVICE_PROVIDER: {
    label: "Provider",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: <Building2 className="h-3 w-3" />,
    dashboard: "/provider",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    icon: <Shield className="h-3 w-3" />,
    dashboard: "/admin",
  },
};

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
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Housiee
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/services"
                          className="group flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-b from-primary/5 to-primary/10 p-6 no-underline outline-none focus:shadow-md hover:bg-primary/15 transition-colors"
                        >
                          <Search className="h-6 w-6 text-primary mb-2" />
                          <div className="mb-2 text-lg font-medium">
                            Browse All
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore all services from verified providers
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li className="space-y-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/services?category=ACCOMMODATION"
                          className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Home className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Accommodation
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Stays & rentals
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/services?category=FOOD"
                          className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Food Services
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Catering & meals
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {!isAuthenticated && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/become-provider"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      Become a Provider
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger */}
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 h-9 rounded-lg border-dashed"
            onClick={openCommandPalette}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Quick search...</span>
            <Kbd className="ml-2">⌘K</Kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={openCommandPalette}
          >
            <Search className="h-5 w-5" />
          </Button>

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse bg-muted rounded-lg" />
          ) : isAuthenticated && user ? (
            <>
              {/* Quick Role Indicator & Switcher */}
              {availableRoles.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "hidden sm:flex gap-1.5 h-8 px-2.5 rounded-full border",
                        roleConfig[activeRole || user.role].color
                      )}
                    >
                      {roleConfig[activeRole || user.role].icon}
                      <span className="text-xs font-medium">
                        {roleConfig[activeRole || user.role].label}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Switch View
                    </DropdownMenuLabel>
                    {availableRoles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={cn(
                          "cursor-pointer gap-2",
                          activeRole === role && "bg-primary/5"
                        )}
                      >
                        {roleConfig[role].icon}
                        <span>{roleConfig[role].label}</span>
                        {activeRole === role && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[10px] px-1.5"
                          >
                            Active
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Quick Actions for Provider */}
              {(activeRole === "SERVICE_PROVIDER" ||
                user.role === "SERVICE_PROVIDER") && (
                <Button
                  variant="ghost"
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
                    className="gap-2 h-9 px-2 hover:bg-primary/5"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                      <span className="text-xs font-semibold text-primary">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground hidden md:block" />
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

                  {user.role === "USER" && (
                    <DropdownMenuItem asChild>
                      <Link href="/become-provider" className="cursor-pointer">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Become a Provider
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 cursor-pointer"
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
              <Button size="sm" asChild className="shadow-lg shadow-primary/20">
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
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Housiee
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <Link
                    href="/services"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                  >
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Browse All Services</span>
                  </Link>
                  <Link
                    href="/services?category=ACCOMMODATION"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                  >
                    <Home className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Accommodation</span>
                  </Link>
                  <Link
                    href="/services?category=FOOD"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                  >
                    <Utensils className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Food Services</span>
                  </Link>
                </div>

                {isAuthenticated && user && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="space-y-1">
                      <Link
                        href={roleConfig[activeRole || user.role].dashboard}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => dispatch(setMobileMenuOpen(false))}
                      >
                        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => dispatch(setMobileMenuOpen(false))}
                      >
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">My Bookings</span>
                      </Link>
                    </div>
                  </>
                )}

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
                  <Button
                    variant="outline"
                    onClick={() => {
                      dispatch(setMobileMenuOpen(false));
                      handleSignOut();
                    }}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
