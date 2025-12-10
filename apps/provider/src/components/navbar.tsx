"use client";

import { Navbar as NextNavbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import { User, LogOut, Calendar, Home } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <NextNavbar maxWidth="xl" className="bg-white/80 backdrop-blur-md border-b border-slate-100">
      <NavbarBrand>
        <Link href="/" className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          ServiceHub
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem>
          <Link href="/listings" className="text-slate-600 hover:text-blue-600 transition-colors">
            Browse Services
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/listings?category=ACCOMMODATION" className="text-slate-600 hover:text-blue-600 transition-colors">
            Accommodation
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/listings?category=FOOD" className="text-slate-600 hover:text-blue-600 transition-colors">
            Food
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user.name}
                size="sm"
                src={user.avatar}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold text-blue-600">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="dashboard" startContent={<Home className="w-4 h-4" />} as={Link} href="/dashboard">
                Dashboard
              </DropdownItem>
              <DropdownItem key="bookings" startContent={<Calendar className="w-4 h-4" />} as={Link} href="/dashboard/bookings">
                My Bookings
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut className="w-4 h-4" />} onClick={logout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem>
              <Button as={Link} href="/login" variant="light" color="primary">
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} href="/register" color="primary" className="font-semibold">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </NextNavbar>
  );
}
