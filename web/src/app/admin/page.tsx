"use client";

import { useAuth } from "@/context/AuthContext";
import { FileText, FileImage, Briefcase, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ pages: 0, blogs: 0, applications: 0 });
  const [rawTrafficData, setRawTrafficData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [pagesSnap, blogsSnap, appsSnap, trafficSnap] = await Promise.all([
          getCountFromServer(collection(db, "pages")),
          getCountFromServer(collection(db, "blog_posts")),
          getCountFromServer(collection(db, "applications")),
        const trafficSnap = await getDocs(query(collection(db, "website_traffic"), orderBy("date", "desc"), limit(365)));

        setMetrics({
          pages: pagesSnap.data().count,
          blogs: blogsSnap.data().count,
          applications: appsSnap.data().count,
        });

        const traffic = trafficSnap.docs.map(doc => doc.data());
        // Sort back to ascending for the chart
        setRawTrafficData(traffic.sort((a, b) => a.date.localeCompare(b.date)));
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const getFilteredTrafficData = () => {
    if (rawTrafficData.length === 0) return [];
    
    const now = new Date();
    
    if (timeRange === "week" || timeRange === "month") {
      const days = timeRange === "week" ? 7 : 30;
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - days);
      
      // Filter last N days and format dates nicely
      return rawTrafficData
        .filter(d => new Date(d.date) >= cutoff)
        .map(d => ({
          name: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          views: d.views || 0,
          visitors: d.visitors || 0
        }));
    } else {
      // Year view: Aggregate by month
      const cutoff = new Date(now);
      cutoff.setFullYear(now.getFullYear() - 1);
      
      const monthlyData: Record<string, { views: number, visitors: number }> = {};
      
      rawTrafficData
        .filter(d => new Date(d.date) >= cutoff)
        .forEach(d => {
          const date = new Date(d.date);
          const monthKey = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { views: 0, visitors: 0 };
          }
          monthlyData[monthKey].views += (d.views || 0);
          monthlyData[monthKey].visitors += (d.visitors || 0);
        });
        
      return Object.entries(monthlyData).map(([name, data]) => ({
        name,
        views: data.views,
        visitors: data.visitors
      }));
    }
  };

  const chartData = getFilteredTrafficData();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      {/* Welcome Header - Open & Airy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3a356a] mb-2 tracking-tight">
            Good morning, Admin.
          </h1>
          <p className="text-slate-500 text-lg">
            Logged in as <span className="font-medium text-slate-700">{user?.email}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-bold tracking-wide text-emerald-700">All Systems Operational</span>
        </div>
      </div>

      {/* Independent Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link href="/admin/pages" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#6C63FF]/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#6C63FF]/10 transition-colors">
              <FileText className="text-slate-400 group-hover:text-[#6C63FF] transition-colors" size={24} />
            </div>
            <h3 className="text-slate-500 font-semibold text-base">Total pages</h3>
          </div>
          <div className="flex items-baseline space-x-3">
            <p className="text-5xl font-black text-[#3a356a] tracking-tight">{loading ? "..." : metrics.pages}</p>
          </div>
        </Link>

        <Link href="/admin/blogs" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#6C63FF]/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#6C63FF]/10 transition-colors">
              <FileImage className="text-slate-400 group-hover:text-[#6C63FF] transition-colors" size={24} />
            </div>
            <h3 className="text-slate-500 font-semibold text-base">Published blogs</h3>
          </div>
          <div className="flex items-baseline space-x-3">
            <p className="text-5xl font-black text-[#3a356a] tracking-tight">{loading ? "..." : metrics.blogs}</p>
          </div>
        </Link>

        <Link href="/admin/careers" className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#6C63FF]/30 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#6C63FF]/10 transition-colors">
              <Briefcase className="text-slate-400 group-hover:text-[#6C63FF] transition-colors" size={24} />
            </div>
            <h3 className="text-slate-500 font-semibold text-base">Job applications</h3>
          </div>
          <div className="flex items-baseline space-x-3">
            <p className="text-5xl font-black text-[#3a356a] tracking-tight">{loading ? "..." : metrics.applications}</p>
          </div>
        </Link>

      </div>

      {/* Recharts Analytics Graph area */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#3a356a] mb-1">Website Traffic</h2>
            <p className="text-slate-500 text-sm">Unique visitor analytics for the last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '12 months'}</p>
          </div>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-1">
            <button onClick={() => setTimeRange("week")} className={`px-5 py-2 text-sm font-bold rounded-md transition-all ${timeRange === 'week' ? 'bg-white text-[#6C63FF] shadow-sm border border-slate-200' : 'text-slate-600 hover:text-[#3a356a]'}`}>Week</button>
            <button onClick={() => setTimeRange("month")} className={`px-5 py-2 text-sm font-bold rounded-md transition-all ${timeRange === 'month' ? 'bg-white text-[#6C63FF] shadow-sm border border-slate-200' : 'text-slate-600 hover:text-[#3a356a]'}`}>Month</button>
            <button onClick={() => setTimeRange("year")} className={`px-5 py-2 text-sm font-bold rounded-md transition-all ${timeRange === 'year' ? 'bg-white text-[#6C63FF] shadow-sm border border-slate-200' : 'text-slate-600 hover:text-[#3a356a]'}`}>Year</button>
          </div>
        </div>

        <div className="h-[350px] w-full flex items-center justify-center border-t border-slate-100 pt-8 mt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#3a356a', fontWeight: 800 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area type="monotone" name="Page Views" dataKey="views" stroke="#6C63FF" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" name="Unique Visitors" dataKey="visitors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto p-8 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-200">
                <BarChart3 className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No traffic data yet</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We're waiting for your first visitors to arrive. Once traffic starts flowing, your analytics will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
