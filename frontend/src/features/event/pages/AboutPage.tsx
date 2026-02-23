// src/features/pages/AboutPage.tsx
import { Navbar } from "../componenets/Navbar";
import { Footer } from "../componenets/Footer";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Link } from "react-router-dom";
import { Rocket, Ticket, BarChart3 } from "lucide-react";
import { useCategoryList } from "../hooks/useCategoryList";

export default function AboutPage() {
  const { user } = useCurrentUser();
  const { categories } = useCategoryList();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#202127]">
      <Navbar user={user as any} showSearch={false} />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto mt-4 h-[570px] rounded-2xl overflow-hidden text-white">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1582711012124-a56cf82307a0?q=80&w=1840&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Crowd enjoying a live event"
            className="w-full h-full object-cover"
          ></img>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-50 py-16 pt-70 flex flex-col md:flex-row items-center justify-between h-full">
          <div className="flex-1 text-white text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bringing the world together through live experiences
            </h1>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 gap">
        {/* Features Section */}
        <section className="mb-16 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent dark:from-white">
            Why EventLight?
          </h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Rocket className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Instant Discovery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find the perfect event in seconds, not hours.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Ticket className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Seamless Registration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Register for events with a single click.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Powerful Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track attendance and engagement with real-time metrics.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-5xl mx-auto bg-gray-50 dark:bg-[#181920] rounded-2xl px-6 md:px-10 py-10 md:py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
          </div>

          <div className="space-y-6 text-base md:text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            <p>
              Finding and managing events online is often fragmented, slow, and
              frustrating. Attendees struggle to discover relevant experiences,
              while organizers juggle multiple tools that pull focus away from
              creating great events.
            </p>

            <p>
              EventLight is built to simplify both sides. Attendees get a clean,
              fast way to explore and join events, and organizers use a focused
              dashboard for registrations, ticketing, and audience insights —
              without unnecessary complexity.
            </p>

            <p>
              This project is developed as a real‑world product with an emphasis
              on performance, reliability, and product‑driven decisions based on
              practical use cases, not just demos.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="max-w-4xl mx-auto text-center mt-20 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">
            Meet the founder
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100/70 dark:border-slate-700 p-8 md:p-10">
            <img
              src="https://www.gravatar.com/avatar/?d=mp&s=240"
              alt="Profile placeholder"
              className="mx-auto rounded-full w-32 h-32 md:w-36 md:h-36 object-cover mb-6"
            />

            <h4 className="text-2xl font-semibold mb-1">Bethlehem Tesfaye</h4>

            <p className="text-primary font-medium mb-4">
              Founder & Full‑Stack Developer
            </p>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Bethlehem is the developer behind EventLight, focused on building
              a fast, reliable, and user‑friendly platform for event discovery
              and management. She cares about products that connect people
              through real‑world experiences and communities, not just pixels on
              a screen.
            </p>
          </div>
        </section>

        {/* Action Section */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              Explore EventLight
            </h3>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Discover events happening around you or start organizing your own
              experiences in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/discover-event">Discover events</Link>
              </Button>

              <Button variant="outline" asChild>
                <Link to="/organizer/dashboard">Organize an event</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer
        categories={categories.map((c: any) => c.name)}
        onSelectCategory={() => {}}
      />
    </div>
  );
}
