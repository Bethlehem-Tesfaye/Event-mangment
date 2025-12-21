import { notFound } from "@/assets";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-[#f2ffff] to-[#f2618f] min-h-screen w-full px-4">
      <div className="relative z-10 max-w-2xl text-center">
        <img
          src={notFound}
          alt="Not found"
          aria-hidden="true"
          className="mx-auto w-64 h-48 object-contain opacity-70 select-none pointer-events-none"
        />

        <h1 className="mt-8 text-4xl font-extrabold text-[#230b25]">404</h1>
        <p className="mt-2 text-lg text-[#3b2a2f]">
          Page not found — this page doesn't exist.
        </p>

        <div className="mt-6">
          <Link to="/">
            <Button>Back home</Button>
          </Link>
        </div>
      </div>

      <img
        src={notFound}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-6 w-80 opacity-10 mix-blend-overlay transform rotate-6"
      />
    </div>
  );
}
