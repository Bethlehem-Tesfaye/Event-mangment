import React from "react";

export default function PageContainer({
  children,
  hasSidebar = false,
  className = "",
}: {
  children: React.ReactNode;
  hasSidebar?: boolean;
  className?: string;
}) {
  return (
    <main
      className={`px-6 md:px-16 lg:px-24 max-w-7xl mx-auto ${
        hasSidebar ? "md:pl-56" : ""
      } ${className}`}
    >
      {children}
    </main>
  );
}
