import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Star, Share2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { presentation } from "@/assets";
import { Navbar } from "../componenets/NavBar";

const mockEvents = [
  {
    id: 1,
    title: "Rock Concert 2025",
    category: "Music",
    rating: 4.5,
    reviews: 120,
    attendees: 200,
    description: "Rock concert description",
    date: "Friday, September 20, 2025",
    time: "08:00 PM - 11:00 PM",
    venue: "Madison Square Garden",
    address: "4 Pennsylvania Plaza, NY",
    tickets: [
      {
        name: "General Admission",
        price: 120,
        remaining: 50,
        perks: ["All Sessions", "Lunch Included"],
      },
    ],
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    category: "Technology",
    rating: 4.7,
    reviews: 89,
    attendees: 250,
    description: "Join industry leaders for cutting-edge tech discussions...",
    date: "Friday, March 15, 2024",
    time: "09:00 AM - 06:00 PM",
    venue: "Convention Center, San Francisco",
    address: "747 Howard St, San Francisco, CA 94103",
    organizer: {
      name: "TechEvents Inc.",
      rating: 4.8,
      eventsHosted: 25,
      description: "Experienced event organizer specializing in tech events.",
    },
    tickets: [
      {
        name: "Early Bird",
        price: 79,
        originalPrice: 99,
        remaining: 25,
        perks: [
          "All Sessions",
          "Lunch Included",
          "Networking Reception",
          "Conference Materials",
        ],
      },
      {
        name: "General Admission",
        price: 99,
        remaining: 150,
        perks: [
          "All Sessions",
          "Lunch Included",
          "Networking Reception",
          "Conference Materials",
        ],
      },
      {
        name: "VIP Experience",
        price: 199,
        remaining: 15,
        perks: [
          "All Sessions",
          "Premium Lunch",
          "VIP Networking Reception",
          "Speaker Meet & Greets",
          "Conference Materials",
          "VIP Seating",
        ],
      },
    ],
  },
];

export function EventPreview() {
  const { id } = useParams<{ id: string }>();
  const event = mockEvents.find((e) => e.id === Number(id));
  const [tab, setTab] = useState("about");

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-muted-foreground">
        Event not found.{" "}
        <Link to="/browse-event" className="text-red-500">
          Go back to events
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/browse-event">Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage>{event.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mx-30">
          <div className="w-full h-[300px] rounded-lg overflow-hidden">
            <img
              src={presentation}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{event.category}</p>
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{event.rating}</span>
                  <span>({event.reviews} reviews)</span>
                </div>
                <div>{event.attendees} attending</div>
              </div>
              <p className="mt-4 text-muted-foreground">{event.description}</p>

              <Card className="mt-6">
                <CardContent>
                  <CardTitle>Event Details</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="font-semibold">Date</p>
                      <p>{event.date}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Time</p>
                      <p>{event.time}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Venue</p>
                      <p>{event.venue}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs value={tab} onValueChange={setTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about" className="w-full text-center">
                    About
                  </TabsTrigger>
                  <TabsTrigger value="speakers" className="w-full text-center">
                    Speakers
                  </TabsTrigger>
                  <TabsTrigger value="organizer" className="w-full text-center">
                    Organizer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <p className="mt-4 text-muted-foreground">
                    {event.description}
                  </p>
                </TabsContent>

                <TabsContent value="speakers">
                  <p className="mt-4 text-muted-foreground">
                    Speaker information will go here.
                  </p>
                </TabsContent>

                <TabsContent value="organizer">
                  {event.organizer ? (
                    <div className="mt-4">
                      <p className="font-semibold">{event.organizer.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-400" />{" "}
                        {event.organizer.rating} rating
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.organizer.eventsHosted} events hosted
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.organizer.description}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-muted-foreground">
                      No organizer information available.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            {event.tickets && event.tickets.length > 0 && (
              <div className="w-full lg:w-80 flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Select Tickets</h2>
                {event.tickets.map((ticket) => (
                  <Card key={ticket.name} className="border">
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{ticket.name}</p>
                        <p className="text-lg font-bold">${ticket.price}</p>
                      </div>
                      {ticket.originalPrice &&
                        ticket.originalPrice !== ticket.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${ticket.originalPrice}
                          </p>
                        )}
                      <p className="text-sm mt-1">{ticket.remaining} left</p>
                      <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                        {ticket.perks.map((perk, idx) => (
                          <li key={idx}>{perk}</li>
                        ))}
                      </ul>
                      <Button className="mt-4 w-full">Select Ticket</Button>
                    </CardContent>
                  </Card>
                ))}
                <p className="mt-2 text-sm text-muted-foreground">
                  Secure checkout powered by EventHub. Free cancellation up to
                  24 hours before event.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
