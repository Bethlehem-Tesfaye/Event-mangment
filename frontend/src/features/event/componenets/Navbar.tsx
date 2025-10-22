import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Search,
  Globe,
  Menu,
  Calendar,
  User,
} from "lucide-react";
import Logo from "@/components/custom/Logo";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { NavbarProps } from "../types/event";
import { useAuth } from "@/context/AuthContext";
import PulseLoader from "@/components/custom/PulseLoader";

export function Navbar(props: Partial<NavbarProps> & { showSearch?: boolean }) {
  const {
    searchValue = "",
    onSearchChange,
    onSearchSubmit,
    onLogout,
    logoutLoading,
    showSearch = true,
  } = props;
  const { accessToken } = useAuth();
  const isLoggedIn = !!accessToken;
  return (
    <>
      {logoutLoading ? <PulseLoader show /> : ""}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b px-6 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-slate-600">
        <div className="flex items-center gap-24">
          <div className="flex items-center gap-0 font-bold text-xl">
            <Logo />
            <span className="text-[15px] font-semibold text-red-500">
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
                  className="pl-9 pr-0 h-9 w-110 rounded-3xl bg-white dark:bg-slate-800 dark:text-white"
                  aria-label="Search events"
                />
              </form>

              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <div
                role="button"
                onClick={() => onSearchSubmit?.()}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-red-600 rounded-3xl flex items-center justify-center cursor-pointer"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-6">
                <NavigationMenuItem>
                  <NavigationMenuLink href="/organizer/dashboard">
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-0 hover:text-primary hover:bg-gray-200 cursor-pointers"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-[13px]">Organizer Panel</span>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="/browse-event">
                    <Button
                      variant="ghost"
                      className="flex flex-col items-center gap-0 hover:text-primary hover:bg-gray-200 cursor-pointer"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="text-[13px]">Browse Events</span>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/user/myevents">
                      <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-0 hover:text-primary hover:bg-gray-200 cursor-pointer"
                      >
                        <Calendar className="h-5 w-5" />
                        <span className="text-[13px]">My Events</span>
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-gray-200 dark:bg-slate-700">
                  <User />
                </AvatarFallback>
              </Avatar>
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
                  <DropdownMenuItem className="text-red-500" onClick={onLogout}>
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
                  <LayoutDashboard className="h-5 w-5" />
                  Organizer Panel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/browse" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Browse Events
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/user/myevents" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> My Events
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
