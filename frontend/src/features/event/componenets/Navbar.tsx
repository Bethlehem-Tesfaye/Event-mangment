import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  // LayoutDashboard,
  Search,
  // Globe,
  Menu,
  // Calendar,
  ChevronDown,
  ChevronUp,
  Bell as BellIcon,
} from "lucide-react";

import Logo from "@/components/custom/Logo";
import PulseLoader from "@/components/custom/PulseLoader";

import type { NavbarProps } from "../types/event";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useNotification } from "@/features/notification/hooks/useNotification";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Navbar(props: Partial<NavbarProps> & { showSearch?: boolean }) {
  const {
    searchValue = "",
    onSearchChange,
    onSearchSubmit,
    onLogout,
    logoutLoading,
    showSearch = true,
    user: propUser,
  } = props;

  const { user: authUser, isPending: authLoading } = useCurrentUser();
  const { profile } = useProfile({
    onSuccess: (data) => console.log("Updated!", data),
    onError: (err) => console.error(err),
  });

  const { data: notifications = [] } = useNotification();
  const queryClient = useQueryClient();

  const effectiveUser = propUser ?? authUser;
  const isLoggedIn = !!effectiveUser;

  const [open, setOpen] = useState(false);

  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;

  useEffect(() => {
    // ensure socket connected and listen for notification:new
    if (!socket.connected) socket.connect();

    const onNew = (notif: any) => {
      console.log("socket -> notification:new payload:", notif);
      queryClient.setQueryData(["notification"], (old: any[] | undefined) => {
        return [notif, ...(old || [])];
      });
      toast.message("New notification received", {
        description: notif?.message ?? JSON.stringify(notif),
      });
    };

    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [queryClient]);

import type { NavbarProps } from "../types/event";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useNotification } from "@/features/notification/hooks/useNotification";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Navbar(props: Partial<NavbarProps> & { showSearch?: boolean }) {
  const {
    searchValue = "",
    onSearchChange,
    onSearchSubmit,
    onLogout,
    logoutLoading,
    showSearch = true,
    user: propUser,
  } = props;

  const { user: authUser, isPending: authLoading } = useCurrentUser();
  const { profile } = useProfile({
    onSuccess: (data) => console.log("Updated!", data),
    onError: (err) => console.error(err),
  });

  const { data: notifications = [] } = useNotification();
  const queryClient = useQueryClient();

  const effectiveUser = propUser ?? authUser;
  const isLoggedIn = !!effectiveUser;

  const [open, setOpen] = useState(false);

  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;

  useEffect(() => {
    // ensure socket connected and listen for notification:new
    if (!socket.connected) socket.connect();

    const onNew = (notif: any) => {
      console.log("socket -> notification:new payload:", notif);
      queryClient.setQueryData(["notification"], (old: any[] | undefined) => {
        return [notif, ...(old || [])];
      });
      toast.message("New notification received", {
        description: notif?.message ?? JSON.stringify(notif),
      });
    };

    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [queryClient]);

  return (
    <>
      {logoutLoading && <PulseLoader show />}
      <nav className="sticky top-0 z-50 border-b bg-gray-100 dark:bg-[#202127] border-gray-200 dark:border-slate-900">
        <div className="w-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-0 font-bold text-xl">
              <Logo />
              <span className="text-[15px] font-semibold text-primary">
                EventLight
              </span>
            </div>

            {showSearch && (
              <div className="relative hidden md:block">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSearchSubmit?.();
                  }}
                >
                  <Input
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    type="text"
                    placeholder="Search events..."
                    className="pl-9 pr-0 h-9 w-110 rounded-3xl bg-white dark:bg-[#202127] dark:text-white"
                    aria-label="Search events"
                  />
                </form>

                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <div
                  role="button"
                  onClick={() => onSearchSubmit?.()}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary rounded-3xl flex items-center justify-center cursor-pointer"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <NavigationMenu>
                <NavigationMenuList className="flex gap-3">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/organizer/dashboard">
                        <Button
                          variant="ghost"
                          className="px-2 py-1 hover:text-primary hover:bg-gray-200 cursor-pointer"
                        >
                          <span className="text-xs">Organizer</span>
                        </Button>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/browse-event">
                        <Button
                          variant="ghost"
                          className="px-2 py-1 hover:text-primary hover:bg-gray-200 cursor-pointer"
                        >
                          <span className="text-xs">Browse</span>
                        </Button>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link to="/user/myevents">
                        <Button
                          variant="ghost"
                          className="px-2 py-1 hover:text-primary hover:bg-gray-200 cursor-pointer"
                        >
                          <span className="text-xs">My Events</span>
                        </Button>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Notifications as text (no icon) */}
            <div className="relative mr-2">
              <Link to="/notifications" className="inline-block">
                <BellIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1 text-[10px] font-semibold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <DropdownMenu onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer px-2 py-1">
                  <Avatar className="cursor-pointer">
                    {authLoading ? (
                      <Skeleton className="h-8 w-8 rounded-full bg-gray-400" />
                    ) : (
                      <>
                        <AvatarImage src={profile?.picture ?? ""} alt="You" />
                        <AvatarFallback className="rounded-full bg-gray-300">
                          {effectiveUser?.email?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  {authLoading ? (
                    <Skeleton className="h-4 w-28 rounded ml-2  bg-gray-400" />
                  ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                      {effectiveUser?.email || null}
                    </span>
                  )}
                  {open ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                    <Link to="/settings">
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="text-primary"
                      onClick={onLogout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login">Login</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/register">Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="md:hidden p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/organizer/dashboard"
                    className="flex items-center gap-2"
                  >
                    {/* <LayoutDashboard className="h-5 w-5" /> */}
                    Organizer Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/browse-event" className="flex items-center gap-2">
                    {/* <Globe className="h-4 w-4" /> Browse Events */}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/user/myevents" className="flex items-center gap-2">
                    {/* <Calendar className="h-4 w-4" /> My Events */}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
}
