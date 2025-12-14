"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCommandPaletteOpen } from "@/lib/store/slices/uiSlice";
import { useAuth } from "@/components/providers";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Search,
  User,
  Settings,
  LogOut,
  Building2,
  Calendar,
  Package,
  Shield,
  Users,
  Star,
  Plus,
  TrendingUp,
  Plane,
  Utensils,
  Shirt,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

export function CommandPalette() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { commandPaletteOpen } = useAppSelector((state) => state.ui);
  const { user, isAuthenticated } = useAuth();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      dispatch(setCommandPaletteOpen(open));
    },
    [dispatch]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(!commandPaletteOpen));
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, dispatch]);

  const runCommand = useCallback(
    (command: () => void) => {
      dispatch(setCommandPaletteOpen(false));
      command();
    },
    [dispatch]
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Search services, pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Services">
          <CommandItem onSelect={() => runCommand(() => router.push("/services"))}>
            <Search className="mr-2 h-4 w-4" />
            Browse All Services
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/services?category=TRAVEL"))}
          >
            <Plane className="mr-2 h-4 w-4" />
            Travel Services
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/services?category=FOOD"))}
          >
            <Utensils className="mr-2 h-4 w-4" />
            Food Services
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/services?category=ACCOMMODATION"))
            }
          >
            <Home className="mr-2 h-4 w-4" />
            Accommodation
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/services?category=LAUNDRY"))}
          >
            <Shirt className="mr-2 h-4 w-4" />
            Laundry Services
          </CommandItem>
        </CommandGroup>

        {isAuthenticated && user && (
          <>
            <CommandSeparator />
            <CommandGroup heading="My Account">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/dashboard"))}
              >
                <Calendar className="mr-2 h-4 w-4" />
                My Bookings
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/settings"))}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {isAuthenticated &&
          user &&
          (user.role === "SERVICE_PROVIDER" || user.role === "ADMIN") && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Provider">
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/provider"))}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Provider Dashboard
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/provider/services/new"))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Service
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => router.push("/provider/reviews"))
                  }
                >
                  <Star className="mr-2 h-4 w-4" />
                  Reviews
                </CommandItem>
              </CommandGroup>
            </>
          )}

        {isAuthenticated && user && user.role === "ADMIN" && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/admin"))}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Overview
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/admin/users"))}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/admin/providers"))}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Manage Providers
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/admin/templates"))}
              >
                <Package className="mr-2 h-4 w-4" />
                Service Templates
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          {!isAuthenticated ? (
            <>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/login"))}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/login?tab=register"))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </CommandItem>
            </>
          ) : (
            <CommandItem
              onSelect={() => runCommand(handleSignOut)}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
