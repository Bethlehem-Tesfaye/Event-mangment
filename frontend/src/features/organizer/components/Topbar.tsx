import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Topbar({
  onOpenCreate,
  search,
  setSearch,
}: {
  onOpenCreate: () => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="flex items-center justify-between gap-2 p-4 bg-card border-b">
      {/* Left section */}
      <div className="flex items-center gap-7">
        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          🔍
        </Button>

        {/* Desktop search */}
        <div className={`flex items-center gap-2 ${showMobileSearch ? "flex" : "hidden"} md:flex`}>
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search events"
            className="w-36 sm:w-48 md:w-72"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Only show create button on md+ screens */}
        <Button onClick={onOpenCreate} className="hidden md:inline-block">
          + New Event
        </Button>

        <Avatar>
          <AvatarImage src="/avatar.png" alt="You" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
