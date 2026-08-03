"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

const Navbar = () => {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-black/10">

      {/* Left - Search */}
      <div className="w-96">
        <Input
          placeholder="Search orders, restaurants..."
          className=" bg-white border-color- text-black placeholder:text-gray-400 focus:ring-0 focus:border-none"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <Bell className="w-5 h-5 text-gray-300 cursor-pointer" />

        <Avatar>
          <AvatarFallback className="bg-[#FF5E24] text-white">
            AD
          </AvatarFallback>
        </Avatar>

      </div>
    </header>
  );
};
export default Navbar;