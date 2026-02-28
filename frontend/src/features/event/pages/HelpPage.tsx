import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Navbar } from "@/features/event/componenets/Navbar";
import { Footer } from "@/features/event/componenets/Footer";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CircleDollarSign,
  Ticket,
  UserRound,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useCategoryList } from "../hooks/useCategoryList";

type TopicKey = "buy" | "tickets" | "account" | "organizing" | "policies";

type Article = {
  title: string;
  topic: TopicKey;
  content?: string; // detailed answer
};

const ARTICLES: Article[] = [
  // Buy & register
  {
    title: "How do I register for an event?",
    topic: "buy",
    content:
      "You can register from the Browse Events page by selecting an event and the ticket type you want to purchase.",
  },
  {
    title: "What payment methods can I use?",
    topic: "buy",
    content: "You can pay using the Chapa payment gateway.",
  },
  {
    title: "What happens if my payment fails?",
    topic: "buy",
    content:
      "You will be notified if payment fails. Retry the payment, and make sure your account has sufficient balance.",
  },
  {
    title: "Can I reserve tickets?",
    topic: "buy",
    content: "Currently, ticket reservations are not supported.",
  },
  {
    title: "How do I receive my ticket?",
    topic: "buy",
    content:
      "If your registration is successful, you will receive an email with the ticket QR code.",
  },
  {
    title: "Are there any discounts available?",
    topic: "buy",
    content: "No, discounts are not available at the moment.",
  },

  // Tickets
  {
    title: "Where can I find my tickets?",
    topic: "tickets",
    content: "Go to 'My Tickets' in the navbar to view your tickets.",
  },
  {
    title: "Can I access tickets without an account?",
    topic: "tickets",
    content: "Yes, you can use the ticket recovery link sent to your email.",
  },
  {
    title: "Can I transfer my tickets to someone else?",
    topic: "tickets",
    content:
      "You can transfer tickets, but the recipient will need your QR code to attend the event.",
  },
  {
    title: "Can I download my ticket QR code?",
    topic: "tickets",
    content: "Yes, you can download your QR code for offline use.",
  },
  {
    title: "What if I lose my ticket email?",
    topic: "tickets",
    content:
      "Since we also send the ticket to your email, you won't lose access as long as your email is active.",
  },
  {
    title: "How is my ticket verified at the event?",
    topic: "tickets",
    content: "Your ticket is scanned using the QR code at the event entrance.",
  },

  // Account
  {
    title: "How do I create an account?",
    topic: "account",
    content: "Click Sign Up and enter your details to create an account.",
  },
  {
    title: "How do I reset my password?",
    topic: "account",
    content: "Go to Settings and use the 'Reset password' option.",
  },
  {
    title: "Where can I view or edit my profile?",
    topic: "account",
    content:
      "Use the Profile option in the dropdown at the top-right of the navbar.",
  },
  {
    title: "Can I delete my account?",
    topic: "account",
    content: "Account deletion is not available. You can log out instead.",
  },
  {
    title: "Can I link multiple accounts?",
    topic: "account",
    content: "This feature is not implemented yet.",
  },

  // Organizing events
  {
    title: "How do I create an event?",
    topic: "organizing",
    content:
      "Log in, then go to the Organizer Dashboard and fill out the event creation forms.",
  },
  {
    title: "How do I set ticket types and prices?",
    topic: "organizing",
    content: "While adding tickets, you can set the ticket type and price.",
  },
  {
    title: "How do I manage attendees?",
    topic: "organizing",
    content:
      "In the Organizer Dashboard, the Events section shows all attendees for your event.",
  },
  {
    title: "How do I view event analytics?",
    topic: "organizing",
    content:
      "Use the Analytics section in the Organizer Dashboard to view performance metrics.",
  },

  // Terms & policies
  {
    title: "Is there a refund policy?",
    topic: "policies",
    content: "Currently, there is no refund policy.",
  },
  {
    title: "Where can I read the terms of service?",
    topic: "policies",
    content: "Read our full Terms of Service here: /term-and-agreement",
  },
  {
    title: "Are there any age restrictions?",
    topic: "policies",
    content: "No restrictions have been implemented yet.",
  },
  {
    title: "What happens if an event is canceled?",
    topic: "policies",
    content:
      "If an event is canceled, it will be marked as canceled in your tickets.",
  },
];

const TOPICS = [
  { key: "buy", title: "Buy & register", icon: CircleDollarSign },
  { key: "tickets", title: "Your tickets", icon: Ticket },
  { key: "account", title: "Your account", icon: UserRound },
  { key: "organizing", title: "Organizing events", icon: ClipboardList },
  { key: "policies", title: "Terms & policies", icon: FileText },
];

export default function HelpPage() {
  const { user } = useCurrentUser();
  const [activeTopic, setActiveTopic] = useState<TopicKey>("buy");
  const [query, _setQuery] = useState("");
  const { categories } = useCategoryList();

  const filtered = useMemo(() => {
    return ARTICLES.filter(
      (a) =>
        a.topic === activeTopic &&
        a.title.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [activeTopic, query]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#202127]">
      <Navbar user={user as any} showSearch={false} />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1b1146] dark:text-white">
            How can we help?
          </h1>
        </section>

        {/* Topics */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[#1b1146] dark:text-white mb-5">
            Browse by topic
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTopic === topic.key;

              return (
                <button
                  key={topic.key}
                  onClick={() => setActiveTopic(topic.key as TopicKey)}
                  className={`rounded-lg border px-6 py-8 text-center transition
                    ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "bg-white dark:bg-[#181920] hover:border-indigo-300"
                    }`}
                >
                  <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-[#2d2f3d]">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </span>

                  <p className="font-semibold text-[#1b1146] dark:text-gray-100">
                    {topic.title}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Accordion Articles */}
        <section>
          <h2 className="text-2xl font-bold text-[#1b1146] dark:text-white mb-5">
            Featured Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-2 text-left">
            {filtered.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border rounded-lg"
              >
                <AccordionTrigger className="w-full text-left flex items-center gap-3 px-5 py-4 font-semibold text-[#1b1146] dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-[#2d2f3d] transition">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="flex-1">{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-4 text-gray-700 dark:text-gray-300">
                  {item.content || "Content coming soon..."}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bottom CTA */}
        <section className="mt-20 text-center">
          <h3 className="text-3xl font-extrabold text-[#1b1146] dark:text-white">
            Still have questions?
          </h3>
          <Link to="/contact">
            <Button className="mt-6 bg-[#f26522] hover:bg-[#dd591a] text-white px-7">
              Contact us
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>
      </main>

      <Footer
        categories={categories.map((c: any) => c.name)}
        onSelectCategory={() => {}}
      />
    </div>
  );
}
