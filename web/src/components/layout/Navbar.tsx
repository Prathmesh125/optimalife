"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About us", href: "/about-us" },
    { name: "Products", href: "/products" },
    { name: "Optiserve", href: "/optiserve" },
    { name: "Careers", href: "/careers" },
    { name: "Blogs", href: "/blogs" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm py-3" : "bg-white py-5"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50">
          <img 
            src="/logo.png" 
            alt="Optima Life Sciences Logo" 
            className="h-10 md:h-12 w-auto object-contain" 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 rounded-full font-semibold text-[15px] transition-all ${
                  isActive 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:block">
          <Link
            href="/contact-us"
            className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full text-[15px] font-bold hover:bg-[var(--color-primary-light)] transition-colors"
          >
            Contact us
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden z-50 text-slate-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center space-y-6 z-40"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-8 py-3 rounded-full text-2xl font-bold transition-all ${
                    isActive 
                      ? "bg-[var(--color-primary)] text-white" 
                      : "text-slate-600 hover:text-[var(--color-primary)]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/contact-us"
              className="mt-4 bg-[var(--color-primary)] text-white px-10 py-4 rounded-full text-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact us
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
