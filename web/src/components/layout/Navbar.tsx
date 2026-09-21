"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const productCategories = [
  {
    name: "Feed Additives",
    href: "/products#feed-additives",
    subcategories: [
      { name: "Cost-Effective Performance Solutions", href: "/products#cost-effective" },
      { name: "Gut Health Solutions", href: "/products#gut-health" },
      { name: "Enzyme Solutions", href: "/products#enzyme" },
      { name: "Mineral Solutions", href: "/products#mineral" },
      { name: "Feed Quality Milling Solutions", href: "/products#feed-quality" },
    ],
  },
  { name: "Bio Security", href: "/products#bio-security" },
  { name: "Dosing System", href: "/products#dosing-system" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About us", href: "/about-us" },
    { name: "Products", href: "/products", hasDropdown: true },
    { name: "Optiserve", href: "/optiserve" },
    { name: "Careers", href: "/careers" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact Us", href: "/contact-us" },
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
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            
            if (link.hasDropdown) {
              return (
                <div key={link.name} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProductsOpen(!productsOpen)}
                    className={`flex items-center font-medium text-[15px] transition-colors ${
                      isActive || productsOpen
                        ? "text-[#6C63FF]" 
                        : "text-[#6C63FF]/70 hover:text-[#6C63FF]"
                    }`}
                  >
                    {link.name}
                    <ChevronDown size={16} className={`ml-1 transition-transform duration-300 ${productsOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Level 1 Dropdown */}
                  <div 
                    className={`absolute top-full left-0 mt-4 w-56 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] transition-all duration-200 z-50 origin-top-left ${
                      productsOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
                    }`}
                  >
                    {productCategories.map((category) => (
                      <div key={category.name} className="relative group/sub border-b border-slate-100 last:border-0">
                        <Link 
                          href={category.href}
                          onClick={() => setProductsOpen(false)}
                          className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-[#6C63FF]/80 hover:text-[#6C63FF] hover:bg-slate-50 transition-colors"
                        >
                          {category.name}
                          {category.subcategories && <ChevronRight size={16} className="opacity-70 text-[#3a356a]" />}
                        </Link>
                        
                        {/* Level 2 Dropdown (Subcategories) */}
                        {category.subcategories && (
                          <div className="absolute top-0 left-[100%] w-72 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setProductsOpen(false)}
                                className="block px-5 py-3.5 text-[15px] font-medium text-[#6C63FF]/80 hover:text-[#6C63FF] hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
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
                className={`font-medium text-[15px] transition-colors ${
                  isActive 
                    ? "text-[#6C63FF]" 
                    : "text-[#6C63FF]/70 hover:text-[#6C63FF]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

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
                      className={`px-8 py-3 text-2xl font-medium transition-all ${
                        isActive 
                          ? "text-[#6C63FF]" 
                          : "text-[#6C63FF]/70 hover:text-[#6C63FF]"
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
                          className="text-[#6C63FF]/60 font-medium text-lg hover:text-[#6C63FF]"
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
                  className={`px-8 py-3 text-2xl font-medium transition-all ${
                    isActive 
                      ? "text-[#6C63FF]" 
                      : "text-[#6C63FF]/70 hover:text-[#6C63FF]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
