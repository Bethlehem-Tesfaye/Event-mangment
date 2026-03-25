// src/features/pages/ContactPage.tsx
import { useState } from "react";
import { Navbar } from "@/features/event/componenets/Navbar";
import { Footer } from "@/features/event/componenets/Footer";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { toast } from "sonner";
import { useCategoryList } from "../hooks/useCategoryList";

export default function ContactPage() {
  const { user } = useCurrentUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const { categories } = useCategoryList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with real API call later
    toast.success("Message sent successfully!");
    setName("");
    setEmail(user?.email ?? "");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user as any} showSearch={false} />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
        <p className="mb-6">
          Have questions or feedback? Send us a message below.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202127] text-gray-800 dark:text-gray-200"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202127] text-gray-800 dark:text-gray-200"
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202127] text-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded hover:bg-primary/90 transition"
          >
            Send Message
          </button>
        </form>
      </main>
      <Footer
        categories={categories.map((c: any) => c.name)}
        onSelectCategory={() => {}}
      />
    </div>
  );
}
