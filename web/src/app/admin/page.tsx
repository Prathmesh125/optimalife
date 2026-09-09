"use client";

import { useAuth } from "@/context/AuthContext";
import { FileText, FileImage, Briefcase, TrendingUp, Users, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ pages: 0, blogs: 0, applications: 0 });
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [pagesSnap, blogsSnap, appsSnap, trafficSnap] = await Promise.all([
          getCountFromServer(collection(db, "pages")),
          getCountFromServer(collection(db, "blog_posts")),
          getCountFromServer(collection(db, "applications")),
          getDocs(query(collection(db, "website_traffic"), orderBy("date", "asc"))),
        ]);

        setMetrics({
          pages: pagesSnap.data().count,
          blogs: blogsSnap.data().count,
          applications: appsSnap.data().count,
        });

        const traffic = trafficSnap.docs.map(doc => {
          const data = doc.data();
          return { name: data.date, views: data.views };
        });
        setTrafficData(traffic);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome Header - Clean & Structural */}
      <div className="bg-[#1a1f2c] rounded-2xl p-8 md:p-10 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 tracking-tight font-serif text-white">
            Good morning, Admin.
          </h1>
          <p className="text-slate-400 text-lg">
            Logged in as <span className="text-slate-200">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-lg px-5 py-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-medium tracking-wide text-slate-300">All Systems Operational</span>
        </div>
      </div>

      {/* Unified Metrics Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          <Link href="/admin/pages" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
              <h3 className="text-slate-500 font-medium text-sm uppercase tracking-widest">Total Pages</h3>
            </div>
            <div className="flex items-baseline space-x-3">
              <p className="text-4xl font-bold text-slate-900 tracking-tight">{loading ? "..." : metrics.pages}</p>
            </div>
          </Link>

          <Link href="/admin/blogs" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center space-x-3 mb-4">
              <FileImage className="text-slate-400 group-hover:text-emerald-600 transition-colors" size={20} />
              <h3 className="text-slate-500 font-medium text-sm uppercase tracking-widest">Published Blogs</h3>
            </div>
            <div className="flex items-baseline space-x-3">
              <p className="text-4xl font-bold text-slate-900 tracking-tight">{loading ? "..." : metrics.blogs}</p>
            </div>
          </Link>

          <Link href="/admin/careers" className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className="text-slate-400 group-hover:text-orange-600 transition-colors" size={20} />
              <h3 className="text-slate-500 font-medium text-sm uppercase tracking-widest">Job Applications</h3>
            </div>
            <div className="flex items-baseline space-x-3">
              <p className="text-4xl font-bold text-slate-900 tracking-tight">{loading ? "..." : metrics.applications}</p>
            </div>
          </Link>

        </div>
      </div>

      {/* Recharts Analytics Graph area */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Website Traffic</h2>
            <p className="text-slate-500 text-sm">Unique visitor analytics for the last 12 days</p>
          </div>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button className="px-4 py-2 bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition border-r border-slate-200">Week</button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium">Month</button>
            <button className="px-4 py-2 bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition border-l border-slate-200">Year</button>
          </div>
        </div>

        <div className="h-[300px] w-full flex items-center justify-center border-t border-slate-100 pt-8 mt-2">
          {trafficData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 font-medium">No traffic data available.</div>
          )}
        </div>
      </div>

    </div>
  );
}
