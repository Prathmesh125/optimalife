"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function Navbar() {
  const [productCategories, setProductCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const q = query(collection(db, "productCategories"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const cats = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          href: `/products#${doc.id}`,
          subcategories: doc.data().subcategories?.map((sub: any) => ({
            name: sub.name,
            href: `/products#${sub.id}`
          })) || []
        }));
        setProductCategories(cats);
      } catch (error) {
        console.error("Error fetching categories for navbar:", error);
      }
    }
    fetchCategories();
  }, []);
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
    { name: "Products", href: "/products", hasDropdown: true },
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
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            
            if (link.hasDropdown) {
              return (
                <div key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center px-5 py-2 rounded-full font-semibold text-[15px] transition-all ${
                      isActive 
                        ? "bg-[var(--color-primary)] text-white" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.name}
                    <ChevronDown size={14} className="ml-1 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                  </Link>

                  {/* Level 1 Dropdown */}
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left group-hover:scale-100 scale-95">
                    {productCategories.map((category, index) => (
                      <div key={category.name} className="relative group/sub">
                        <Link 
                          href={category.href}
                          className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors border-b border-slate-50 last:border-0"
                        >
                          {category.name}
                          {category.subcategories && <ChevronRight size={14} className="opacity-50" />}
                        </Link>
                        
                        {/* Level 2 Dropdown (Subcategories) */}
                        {category.subcategories && (
                          <div className="absolute top-0 left-full w-64 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50 overflow-hidden -ml-2">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className="block px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary)] transition-colors border-b border-slate-50 last:border-0"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

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
            className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center space-y-6 z-40 overflow-y-auto pt-20 pb-10"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              
              if (link.hasDropdown) {
                return (
                  <div key={link.name} className="flex flex-col items-center w-full">
                    <Link
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
                    {/* Simplified mobile sub-menu showing just main categories */}
                    <div className="flex flex-col items-center mt-2 space-y-2">
                      {productCategories.map(cat => (
                        <Link 
                          key={cat.name} 
                          href={cat.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-slate-500 font-medium text-lg"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

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
              className="mt-6 bg-[var(--color-primary)] text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg shadow-blue-500/20"
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

