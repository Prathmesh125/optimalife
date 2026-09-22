"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Mail, Check, X, Search, FileText, CheckCircle2, Clock } from "lucide-react";

type BrochureRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  productName: string;
  productId: string;
  createdAt: string;
  status: "new" | "handled";
};

export default function BrochureRequestsPage() {
  const [requests, setRequests] = useState<BrochureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProduct, setFilterProduct] = useState<string>("All");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const q = query(collection(db, "brochure_requests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BrochureRequest));
        setRequests(data);
      } catch (err) {
        console.error("Error fetching brochure requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "new" ? "handled" : "new";
    try {
      await updateDoc(doc(db, "brochure_requests", id), {
        status: newStatus
      });
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // Get unique product names for the filter dropdown
  const uniqueProducts = Array.from(new Set(requests.map(r => r.productName))).filter(Boolean);
  
  const filteredRequests = filterProduct === "All" 
    ? requests 
    : requests.filter(r => r.productName === filterProduct);

  const uncheckedCount = filteredRequests.filter(r => r.status === "new").length;
  const handledCount = filteredRequests.filter(r => r.status === "handled").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Brochure Requests</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and respond to customer product brochure requests.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-black text-[#3a356a]">{filteredRequests.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Unchecked (New)</p>
            <p className="text-2xl font-black text-[#3a356a]">{uncheckedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Done (Handled)</p>
            <p className="text-2xl font-black text-[#3a356a]">{handledCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50">
          <div className="flex items-center space-x-2 w-full max-w-sm">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filter by Product:</span>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] font-medium"
            >
              <option value="All">All Products</option>
              {uniqueProducts.map(prod => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-16 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Requested Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <FileText size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No brochure requests found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const dateObj = new Date(req.createdAt);
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const isDone = req.status === "handled";
                  
                  const mailSubject = encodeURIComponent(`Optima Life Sciences - Brochure for ${req.productName}`);
                  const mailBody = encodeURIComponent(`Hi ${req.firstName},\n\nThank you for requesting information about ${req.productName}. Please find the brochure attached.\n\nBest regards,\nOptima Life Sciences Team`);

                  return (
                    <tr key={req.id} className={`hover:bg-slate-50 transition-colors ${isDone ? 'opacity-60 grayscale-[50%]' : ''}`}>
                      
                      {/* Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleStatus(req.id, req.status)}
                          className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                              : 'bg-white border-slate-300 text-transparent hover:border-[#6C63FF]'
                          }`}
                          title={isDone ? "Mark as unchecked" : "Mark as done"}
                        >
                          <Check size={14} strokeWidth={4} />
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-700">{dateStr}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{timeStr}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#3a356a]">{req.firstName} {req.lastName}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{req.email}</div>
                        {req.phone && (
                          <div className="text-sm text-slate-500 mt-0.5">{req.phone}</div>
                        )}
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8E6F5] text-[#7B73C7] text-xs font-bold uppercase tracking-wider">
                          {req.productName}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`mailto:${req.email}?subject=${mailSubject}&body=${mailBody}`}
                          onClick={() => {
                            if (!isDone) toggleStatus(req.id, req.status);
                          }}
                          className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                        >
                          <Mail size={14} className="text-[#6C63FF]" />
                          <span>Send Mail</span>
                        </a>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
