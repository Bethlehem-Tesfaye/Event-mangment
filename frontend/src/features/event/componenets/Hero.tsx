import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { CalendarCheck, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  const [index, setIndex] = useState(0);
  const messages = [
    "Discover Amazing Events Near You",
    "Connect, Attend & Share Experiences",
    "Find Events That Inspire You",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative max-w-7xl mx-auto h-[500px] rounded-2xl overflow-hidden text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1470&q=80"
          alt="Crowd enjoying a live event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-16 flex flex-col md:flex-row items-center justify-between h-full">
        {/* Text */}
        <div className="flex-1 text-center md:text-left max-w-xl">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
            {messages[index]}
          </h1>

          <p className="text-sm md:text-base mb-4 text-white/90">
            EventLight makes finding and managing events effortless. Join
            thousands of organizers and attendees worldwide.
          </p>

          {/* CTA */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <Link to="/discover-event">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition">
                Explore Events
              </button>
            </Link>
            <Link to="/organizer/dashboard">
              <button className="border border-white/80 bg-white/5 text-white font-semibold px-5 py-2 rounded-lg transition hover:bg-white/10">
                Create an Event
              </button>
            </Link>
          </div>

          {/* Metrics */}
          <div className="flex flex-col md:flex-row gap-4 mt-4 text-white/80 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              <span className="font-semibold">
                <CountUp end={10000} duration={2.5} separator="," /> events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4" />
              <span className="font-semibold">
                <CountUp end={195} duration={2.5} />+ worldwide
              </span>
            </div>
          </div>
        </div>

        {/* Optional side image on desktop */}
        <div className="flex-1 hidden md:block max-h-[250px] ml-8">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80"
            alt="People networking at an event"
            className="rounded-xl shadow-lg object-cover h-full w-full"
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 w-full text-center text-white/80 text-lg animate-bounce">
        ⬇ Scroll to explore
      </div>
    </section>
  );
}
