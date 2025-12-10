"use client";

import { Navbar as NextNavbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import { LogOut, Home, Clock, List, Shield } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <NextNavbar maxWidth="xl" className="bg-slate-800 border-b border-slate-700">
      <NavbarBrand>
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-500" />
          <span className="font-bold text-xl text-white">Admin Panel</span>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem>
          <Link href="/" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/listings/pending" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/listings" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <List className="w-4 h-4" />
            All Listings
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar isBordered as="button" color="danger" name={user.name} size="sm" />
            </DropdownTrigger>
            <DropdownMenu aria-label="Admin Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                <p className="font-semibold">Admin</p>
                <p className="text-red-500">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut className="w-4 h-4" />} onClick={logout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </NextNavbar>
  );
}
