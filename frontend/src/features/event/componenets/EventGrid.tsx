import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "../utils/date";
import type { EventGridProps } from "../types/event";
import { EmptyEventsPlaceholder } from "./EmptyEventsPlaceholde";


export function EventGrid({ events, isLoading }: EventGridProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card
              key={idx}
              className="shadow-none w-full max-w-[250px] border-0 py-0 mx-auto"
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
      ) : events.length === 0 ? (
        <motion.p
          key="no-events"
          className="col-span-full text-center text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <EmptyEventsPlaceholder/>
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
          {events.map((event) => (
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
                      src={event.eventBannerUrl || "/placeholder.jpg"}
                      alt={event.title}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardContent className="flex flex-col gap-1 py-3">
                    <CardTitle className="text-md font-semibold">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-4 h-4" /> {formatDate(event.startDatetime)}
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
  );
}
