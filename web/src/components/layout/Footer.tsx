"use client";

import Link from "next/link";
import { ChevronRight, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        ...formData,
        createdAt: new Date(),
        status: "new"
      });
      setSubmitted(true);
      setFormData({ name: "", phone: "", email: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-[#f4f7f6] text-slate-700 pt-24 pb-12 overflow-hidden border-t border-slate-200">
      {/* Optional faint background texture or chickens as requested (using a very subtle CSS trick or image overlay) */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: "url('https://pub-6aaa91d5e4134091967cec321adda182.r2.dev/home/hero_farm.jpg')", backgroundSize: 'cover', backgroundPosition: 'center bottom' }}
      ></div>

      {/* Decorative Wave at top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white rounded-b-[100%] scale-x-150 transform -translate-y-1/2 z-10 hidden md:block"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="md:col-span-4">
            <div className="mb-6 inline-block">
              <img src="/logo.png" alt="Optima Life Sciences Logo" className="h-20 w-auto object-contain" />
            </div>
            <address className="not-italic text-sm text-slate-600 space-y-1 mb-8 leading-relaxed font-medium">
              <p>P.NO. 47/2/2, BL 44, LIC Colony,</p>
              <p>Parvati, Pune – 411009,</p>
              <p>Maharashtra, India.</p>
              <p className="pt-2 font-bold text-slate-800">Phone: 020-24420720</p>
            </address>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, link: "https://www.facebook.com/optimalifesciences/" },
                { icon: Twitter, link: "https://twitter.com/LifeOptima" },
                { icon: Youtube, link: "https://www.youtube.com/@optimalifesciences" },
                { icon: Linkedin, link: "https://in.linkedin.com/company/optimalifesciences" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-[#6C63FF] text-white flex items-center justify-center hover:bg-[#5b54d6] hover:-translate-y-1 transition-all shadow-md"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="md:col-span-1 hidden md:block"></div>

          {/* Links Col */}
          <div className="md:col-span-3">
            <h4 className="font-extrabold text-slate-900 text-lg mb-6">Our Links</h4>
            <ul className="space-y-4 text-sm font-semibold text-slate-600">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about-us" },
                { label: "Products", href: "/products" },
                { label: "Career", href: "/careers" },
                { label: "Blogs", href: "/blogs" },
                { label: "Contact Us", href: "/contact-us" }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="flex items-center hover:text-[#6C63FF] transition-colors group">
                    <ChevronRight size={16} className="text-[#6C63FF] mr-2 transition-transform group-hover:translate-x-1" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4">
            <h4 className="font-extrabold text-slate-900 text-lg mb-6">Connect with us</h4>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex space-x-4">
                <input 
                  type="text" 
                  placeholder="Name *" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-1/2 px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 bg-white shadow-sm placeholder:text-slate-400"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-1/2 px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 bg-white shadow-sm placeholder:text-slate-400"
                />
              </div>
              <div className="flex space-x-4">
                <input 
                  type="email" 
                  placeholder="Email *" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="flex-grow px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 bg-white shadow-sm placeholder:text-slate-400"
                />
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`px-8 py-3 rounded-md font-bold transition-colors shadow-md flex-shrink-0 text-white ${submitted ? 'bg-emerald-500' : 'bg-[#6C63FF] hover:bg-[#5b54d6]'}`}
                >
                  {submitting ? 'SENDING...' : submitted ? 'SENT!' : 'SEND'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-slate-300/50 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-medium">
          <p>© {currentYear} Optima Life Science Pvt Ltd. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
