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
import { ChevronDown, ChevronUp, Compass } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";

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

  const { profile } = useProfile({
    onSuccess: (data) => console.log("Updated!", data),
    onError: (err) => console.error(err),
  });
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 h-10">
          <Logo />
          <span className="text-base font-semibold leading-none text-black dark:text-white">
            Eventlight
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/browse-event"
          className="flex  items-center gap-1 cursor-pointer bg-gray-100 px-4 py-2 rounded-sm dark:bg-[#202127]"
          aria-label="Create an event"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-transparent">
            <Compass className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Discover Events
          </span>
        </Link>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer px-2 py-1">
              <Avatar className="cursor-pointer">
                <AvatarImage src={profile?.picture ?? ""} alt="You" />

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
