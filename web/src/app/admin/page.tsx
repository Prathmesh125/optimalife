"use client";

import { useAuth } from "@/context/AuthContext";
import { FileText, FileImage, Briefcase, TrendingUp, Users, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#3a356a] to-[#2b2752] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C63FF] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              Welcome back, Admin! 👋
            </h1>
            <p className="text-white/80 text-lg">
              You are logged in as <span className="font-semibold text-emerald-400">{user?.email}</span>.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">System Status</p>
              <p className="text-white font-bold text-xl tracking-wide">All Systems Operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link href="/admin/pages" className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#6C63FF]/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="text-blue-500" size={28} />
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">Active</span>
          </div>
          <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Total Pages</h3>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-slate-800">12</p>
            <span className="text-sm font-semibold text-emerald-500 flex items-center">+3% this month</span>
          </div>
        </Link>

        <Link href="/admin/blogs" className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-400/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileImage className="text-emerald-500" size={28} />
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">Live</span>
          </div>
          <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Published Blogs</h3>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-slate-800">48</p>
            <span className="text-sm font-semibold text-emerald-500 flex items-center">+12% this month</span>
          </div>
        </Link>

        <Link href="/admin/careers" className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-orange-400/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="text-orange-500" size={28} />
            </div>
            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-100">Pending</span>
          </div>
          <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Job Applications</h3>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-slate-800">15</p>
            <span className="text-sm font-semibold text-orange-500 flex items-center">New this week</span>
          </div>
        </Link>

      </div>

      {/* Simulated Analytics Graph area */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Website Traffic</h2>
            <p className="text-slate-500 font-medium">Visitor analytics for the last 30 days</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-200 transition">Week</button>
            <button className="px-4 py-2 bg-[#6C63FF] text-white rounded-lg font-medium text-sm shadow-md">Month</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-200 transition">Year</button>
          </div>
        </div>

        {/* Mock Graph using pure CSS grids and gradients */}
        <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2 pb-8 border-b border-slate-100">
          {[40, 65, 30, 85, 55, 90, 45, 75, 50, 95, 60, 80].map((val, i) => (
            <div key={i} className="w-full relative group flex justify-center">
              <div 
                className="w-full max-w-[40px] bg-gradient-to-t from-[#6C63FF]/20 to-[#6C63FF] rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-300"
                style={{ height: `${val}%` }}
              ></div>
              <div className="absolute -bottom-8 text-xs font-semibold text-slate-400">{i + 1} Sep</div>
              {/* Tooltip */}
              <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {val * 12} Views
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
