import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/custom/Logo";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface User {
  email?: string;
}

type LogoutHandler = (...args: any[]) => void;

interface TopbarProps {
  user?: User | null;
  onLogout?: LogoutHandler;
}

export default function Topbar({ user, onLogout }: TopbarProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold text-black dark:text-white ">
            Eventlight
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-[#202127]"
        >
          Create Event
        </Button>
        <Link to="/browse-event">
          <Button
            variant="ghost"
            className="px-7 py-1 text-sm  bg-gray-200 dark:bg-[#202127]"
          >
            Browse
          </Button>
        </Link>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer px-2 py-1">
              <Avatar className="cursor-pointer">
                <AvatarImage src="/avatar.png" alt="You" />
                <AvatarFallback>
                  {user?.email ? user.email[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.email || "User"}
              </span>
              {open ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/organizer/profile">Profile</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/organizer/settings">Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-gray-700 dark:text-gray-300"
              onClick={onLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
