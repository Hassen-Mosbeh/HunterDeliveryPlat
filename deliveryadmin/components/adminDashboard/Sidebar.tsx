"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Utensils,
  Motorbike,
  BellRing,
  Percent,
  ChartSpline,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { logoutUser } from "@/actions/auth/logout";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast/headless";
import { Button } from "../ui/button";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-[#FF5E24] text-white flex flex-col transition-all duration-300`}
    >
      {/* Top */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center w-full" : "gap-3"
          }`}
        >
          <Image
            src="/appadminlogo.png" // put in /public
            alt="Hunter Logo"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide transition-opacity duration-200">
            Hunter
          </span>
        )}

        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<ShoppingCart size={20} />}
          label="Orders"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<Motorbike size={20} />}
          label="Drivers"
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<Utensils size={20} />}
          label="Restaurants"
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<Users size={20} />}
          label="Customers"
          collapsed={collapsed}
        />

         <SidebarItem
          icon={<ChartSpline  size={20} />}
          label="Finance"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<Percent  size={20} />}
          label="Commissions"
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<BellRing  size={20} />}
          label="Notifications"
          collapsed={collapsed}
        />
        <SidebarItem
          icon={<Settings size={20} />}
          label="Settings"
          collapsed={collapsed}
        />
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/20">
        <Dialog>
          <DialogTrigger className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition w-full text-left">
            <LogOut size={20} />
            {!collapsed && (
              <span className="text-sm font-semibold">Logout</span>
            )}
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to logout from your account?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex gap-2 justify-end">
              <DialogClose className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100 transition">
                Cancel
              </DialogClose>

              <Button
                className="bg-[#FF5E24] hover:bg-[#e6541f]"
                onClick={async () => {
                  await logoutUser();
                  toast.success("Logged out successfully 👋");
                  router.replace("/");
                }}
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
};

function SidebarItem({
  icon,
  label,
  collapsed,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const baseClasses =
    "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition w-full text-left";

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {icon}
        {!collapsed && <span className="text-sm font-semibold">{label}</span>}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className={baseClasses}>
      {icon}
      {!collapsed && <span className="text-sm font-semibold">{label}</span>}
    </Link>
  );
}
export default Sidebar;
