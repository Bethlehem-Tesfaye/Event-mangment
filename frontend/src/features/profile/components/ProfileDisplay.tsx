import { Phone, MapPin, Globe, Home } from "lucide-react";
import type { ProfileDisplayProps } from "../types/profile";

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const items = [
    { icon: Phone, label: "Phone", value: profile?.phone ?? "-" },
    { icon: MapPin, label: "City", value: profile?.city ?? "-" },
    { icon: Globe, label: "Country", value: profile?.country ?? "-" },
    { icon: Home, label: "Address", value: profile?.address ?? "-" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-300 hover:bg-purple-100 transition"
          >
            <Icon className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700 font-semibold">
                {item.label}
              </p>
              <p className="text-black/80">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
