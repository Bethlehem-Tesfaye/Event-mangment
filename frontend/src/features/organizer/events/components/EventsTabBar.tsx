import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventsTabBarProps } from "../types/eventsLists";

export default function EventsTabBar({
  tabs,
  value,
  onChange,
}: EventsTabBarProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full mt-6">
      <TabsList className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1 dark:bg-gray-900">
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="flex-1 md:min-w-[100px] text-center py-2 capitalize"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
