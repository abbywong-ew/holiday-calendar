"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-[#7A8C3F] sticky top-0 z-50 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-xl tracking-tight">
          MY Calendar
        </span>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1 items-center">
          {[
            { href: "/calendar", label: "Calendar" },
            { href: "/settings", label: "Settings" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-white text-[#5C6B2E] shadow-sm"
                  : "text-white hover:bg-white/15"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white text-2xl leading-none p-1 rounded hover:bg-[#5C6B2E] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#5C6B2E] border-t border-[#4a5525]">
          {[
            { href: "/calendar", label: "Calendar" },
            { href: "/settings", label: "Settings" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-6 py-3 text-white font-medium hover:bg-[#7A8C3F] transition-colors ${
                isActive(href) ? "bg-white/15 border-l-4 border-white pl-5" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
