"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setErrorMsg("");
    
    try {
      await addDoc(collection(db, "inquiries"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: "New",
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setErrorMsg("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
      <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Send a Message</h3>
      
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-bold">Message sent successfully!</p>
            <p className="text-sm text-emerald-600 mt-1">Thank you for reaching out. Our team will get back to you shortly.</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary-light)] outline-none transition-colors text-slate-900"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary-light)] outline-none transition-colors text-slate-900"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary-light)] outline-none transition-colors text-slate-900"
            placeholder="john@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary-light)] outline-none transition-colors text-slate-900"
            placeholder="How can we help you?"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#00381a] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-70"
        >
          <span>{submitting ? "Sending..." : "Send Message"}</span>
          {!submitting && <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
