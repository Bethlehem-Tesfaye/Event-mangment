import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { CalendarCheck, Globe2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Discover, Create & Share Amazing Events",
  "Your Gateway to Unforgettable Experiences",
  "Connect with People, Places & Passions",
  "Find Events That Inspire You",
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[400px] bg-gradient-to-r from-red-400 via-pink-400 to-purple-500 text-white overflow-hidden animate-gradient rounded-2xl">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full animate-float1"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full animate-float2"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-20 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="heading-font text-3xl md:text-5xl font-extrabold mb-6 leading-tight"
          >
            {messages[index]}
          </motion.h1>
        </AnimatePresence>

        <p className="body-font text-sm md:text-base mb-12 text-white/90 max-w-2xl">
          EventLight makes finding and managing events effortless.
        </p>

        <div className="flex gap-12 mt-6 text-white/80 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            <span className="font-semibold">
              <CountUp end={10000} duration={2.5} separator="," /> events hosted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5" />
            <span className="font-semibold">
              <CountUp end={195} duration={2.5} />+ Worldwide
            </span>
          </div>
        </div>
        <div className="mt-16 animate-bounce text-white/80 text-xl md:text-2xl">
          ⬇ Scroll to explore
        </div>
      </div>

      <style>{`
        /* Floating shapes */
        @keyframes float1 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(-50%, -50%) translate(10px, -10px) rotate(2deg) scale(1.05); }
          50% { transform: translate(-50%, -50%) translate(-10px, 5px) rotate(-2deg) scale(0.95); }
          75% { transform: translate(-50%, -50%) translate(5px, 10px) rotate(1deg) scale(1.02); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(25%, 25%) translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(25%, 25%) translate(-10px, 10px) rotate(-2deg) scale(1.05); }
          50% { transform: translate(25%, 25%) translate(5px, -5px) rotate(2deg) scale(0.95); }
          75% { transform: translate(25%, 25%) translate(-5px, 10px) rotate(-1deg) scale(1.02); }
        }
        .animate-float1 { animation: float1 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }

        /* Gradient animation */
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 12s ease infinite;
        }
      `}</style>
    </section>
  );
}
