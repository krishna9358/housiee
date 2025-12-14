"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Settings, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "SERVICE_PROVIDER") return "/provider";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Marketplace</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Services
          </Link>
          <Link
            href="/services?category=ACCOMMODATION"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Accommodation
          </Link>
          <Link
            href="/services?category=FOOD"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Food
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role.toLowerCase().replace("_", " ")}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === "USER" && (
                  <DropdownMenuItem asChild>
                    <Link href="/become-provider">
                      <Settings className="mr-2 h-4 w-4" />
                      Become a Provider
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/login?tab=register">Get Started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          <Link
            href="/services"
            className="block py-2 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            All Services
          </Link>
          <Link
            href="/services?category=ACCOMMODATION"
            className="block py-2 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Accommodation
          </Link>
          <Link
            href="/services?category=FOOD"
            className="block py-2 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Food
          </Link>
        </div>
      )}
    </header>
  );
}
