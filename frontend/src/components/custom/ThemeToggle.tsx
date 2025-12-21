import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 pointer-events-none"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }
  const effective =
    theme === "system"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme || "light";

  const toggle = () => setTheme(effective === "light" ? "dark" : "light");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="transition-colors"
    >
      {effective === "light" ? (
        <Moon className="h-5 w-5 text-gray-700" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </Button>
  );
}
