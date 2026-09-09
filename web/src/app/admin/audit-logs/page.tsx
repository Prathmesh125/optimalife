"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { ClipboardList, ShieldAlert, FilePlus, UserPlus, Trash2, Calendar, User } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  userEmail: string;
  details: string;
  timestamp: any;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getActionConfig = (action: string) => {
    switch (action) {
      case "LOGIN":
        return { icon: ShieldAlert, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "System Login" };
      case "BLOG_CREATED":
        return { icon: FilePlus, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", label: "Blog Created" };
      case "CAREER_CREATED":
        return { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200", label: "Career Created" };
      case "INQUIRY_DELETED":
        return { icon: Trash2, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Inquiry Deleted" };
      default:
        return { icon: ClipboardList, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: action };
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#3a356a] flex items-center tracking-tight">
            <ClipboardList className="mr-3 text-[#6C63FF]" />
            Audit Logs
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time tracking of administrative actions and events.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]"></div>
            <p className="text-slate-500 font-medium">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No activity yet</h3>
            <p className="text-slate-500 max-w-md">Administrative actions will be recorded here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5 pl-8 w-1/4">Action</th>
                  <th className="p-5 w-1/4">User</th>
                  <th className="p-5 w-1/3">Details</th>
                  <th className="p-5 text-right pr-8 w-1/6">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const config = getActionConfig(log.action);
                  const Icon = config.icon;
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5 pl-8 align-middle">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.border} ${config.color}`}>
                          <Icon size={14} />
                          <span className="text-xs font-bold tracking-wide uppercase">{config.label}</span>
                        </div>
                      </td>
                      <td className="p-5 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                            <User size={14} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{log.userEmail}</span>
                        </div>
                      </td>
                      <td className="p-5 align-middle text-sm text-slate-600 font-medium">
                        {log.details}
                      </td>
                      <td className="p-5 pr-8 align-middle text-right">
                        <div className="inline-flex items-center text-sm font-medium text-slate-500 bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-lg group-hover:border-slate-200 transition-colors">
                          <Calendar size={14} className="mr-2 text-slate-400" />
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
