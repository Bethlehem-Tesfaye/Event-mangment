import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Globe, Menu, Calendar, User } from "lucide-react";
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

export function Navbar({
  isLoggedIn,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b px-6 bg-gray-100">
      <div className="flex items-center gap-24">
        <div className="flex items-center gap-0 font-bold text-xl">
          <Logo />
          <span className="text-[15px] font-semibold text-red-500">
            EventLight
          </span>
        </div>
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
              className="pl-9 pr-0 h-9 w-110 rounded-3xl bg-white"
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
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink href="/create">
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-0 hover:text-primary hover:bg-gray-200 cursor-pointers"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[13px]">Create Events</span>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink href="/browse">
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
                <NavigationMenuLink href="/myevents">
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-0 hover:text-primary hover:bg-gray-200 cursor-pointer"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-[13px]">My Events</span>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-gray-200">
                <User />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isLoggedIn ? (
              <>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>My Events</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
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
              <Link to="/create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Event
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/browse" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Browse Events
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/myevents" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> My Events
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
