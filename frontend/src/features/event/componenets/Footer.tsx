import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Github, Linkedin, Instagram } from "lucide-react";

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
  "Finance",
  "Technology",
  "Food",
  "Travel",
  "Lifestyle",
];

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Desktop layout */}
        <div className="hidden md:grid grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white">EventLight</h3>
            <p className="mt-3 text-sm leading-relaxed">
              Discover, join, and enjoy amazing events happening worldwide. From
              concerts to conferences, we bring people together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Browse Events
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-3">Categories</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat}>
                  <a href="#" className="hover:text-white transition-colors">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-semibold text-white mb-3">Follow Us</h4>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Github className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile layout with Accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="quick-links">
              <AccordionTrigger className="text-white">
                Quick Links
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Browse Events
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="categories">
              <AccordionTrigger className="text-white">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Follow Us</h4>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5" />
              <Facebook className="w-5 h-5" />
              <Instagram className="w-5 h-5" />
              <Linkedin className="w-5 h-5" />
              <Github className="w-5 h-5" />
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom */}
        <div className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} EventLight. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
