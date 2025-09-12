import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { presentation } from "@/assets";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "Tech",
  "Business",
  "Education",
  "Health",
  "Entertainment",
  "Art",
  "Science",
  "Sports",
  "Music",
  "Food",
  "Travel",
  "Lifestyle",
];

const mockEvents = [
  {
    id: 1,
    title: "Rock Concert 2025",
    date: "2025-09-20T20:00:00",
    location: "New York",
    category: "Music",
  },
  {
    id: 2,
    title: "Tech Conference",
    date: "2025-10-05T09:00:00",
    location: "San Francisco",
    category: "Tech",
  },
  {
    id: 3,
    title: "Marathon 2025",
    date: "2025-11-15T06:00:00",
    location: "Boston",
    category: "Sports",
  },
  {
    id: 4,
    title: "Jazz Night",
    date: "2025-09-25T19:00:00",
    location: "New York",
    category: "Music",
  },
  {
    id: 5,
    title: "AI Summit",
    date: "2025-10-12T10:00:00",
    location: "San Francisco",
    category: "Tech",
  },
  {
    id: 6,
    title: "City Marathon",
    date: "2025-11-20T07:00:00",
    location: "Boston",
    category: "Sports",
  },
];

export function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const filteredEvents = mockEvents.filter((event) =>
    selectedCategory && selectedCategory !== "All"
      ? event.category === selectedCategory
      : true
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="text-left mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Browse Events</h2>
        <p className="text-muted-foreground mt-1">Explore events by category</p>
      </div>

      {/* Category tabs */}
      <div className="overflow-x-auto scrollbar-none mb-8">
        <div className="flex gap-6 px-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setLoading(true);
                setSelectedCategory(selectedCategory === cat ? null : cat);
              }}
              className={`relative whitespace-nowrap pb-2 font-medium transition-colors text-sm ${
                selectedCategory === cat || (cat === "All" && !selectedCategory)
                  ? "text-red-500"
                  : "text-gray-700 hover:text-red-500"
              }`}
            >
              {cat}
              {(selectedCategory === cat ||
                (cat === "All" && !selectedCategory)) && (
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Event cards */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card
                key={idx}
                className="shadow-none  w-full max-w-[250px] border-0 py-0 mx-auto"
              >
                <Skeleton className="h-[140px] w-full rounded-t-lg" />
                <CardContent className="flex flex-col gap-2 py-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.p
            key="no-events"
            className="col-span-full text-center text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            No events found.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Link to={`/events/${event.id}`}>
                  <Card className="cursor-pointer shadow-none hover:shadow-lg transition-shadow duration-300 w-full max-w-[250px] border-0 py-0 mx-auto">
                    <div className="h-[140px] w-full overflow-hidden rounded-t-lg">
                      <img
                        src={presentation}
                        alt={event.title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="flex flex-col gap-1 py-3">
                      <CardTitle className="text-md font-semibold">
                        {event.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-4 h-4" />{" "}
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
