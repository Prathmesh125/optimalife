"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { Edit2, Plus, Users, Briefcase, CheckCircle2, XCircle } from "lucide-react";

interface JobDoc {
  id: string;
  title: string;
  active: boolean;
  updatedAt: string;
}

export default function AdminCareersList() {
  const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const querySnapshot = await getDocs(collection(db, "careers"));
        const jobsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || doc.id,
            active: data.active !== false,
            updatedAt: data.updatedAt,
          };
        });
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3a356a] tracking-tight">Careers & Jobs</h1>
          <p className="text-slate-500 font-medium mt-1">Manage job postings and review applications.</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/careers/applications"
            className="flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all duration-300 font-bold tracking-wide"
          >
            <Users size={20} />
            <span>Applications</span>
          </Link>
          <Link
            href="/admin/careers/new"
            className="flex items-center space-x-2 bg-[#6C63FF] text-white px-6 py-3 rounded-xl hover:bg-[#5a52d5] shadow-[0_4px_20px_rgba(108,99,255,0.4)] transition-all duration-300 font-bold tracking-wide"
          >
            <Plus size={20} />
            <span>New Job Post</span>
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C63FF]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Job Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                        <Briefcase size={18} />
                      </div>
                      <Link href={`/admin/careers/${job.id}/applicants`} className="font-bold text-[#3a356a] hover:text-[#6C63FF] hover:underline underline-offset-4 transition-all">
                        {job.title.toUpperCase()}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {job.active ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <CheckCircle2 size={14} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
                        <XCircle size={14} />
                        <span>Closed</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                    {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/admin/careers/${job.id}/applicants`}
                      className="inline-flex items-center justify-center w-10 h-10 mr-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 hover:bg-[#6C63FF] hover:text-white hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
                      title="View Applicants"
                    >
                      <Users size={16} />
                    </Link>
                    <Link
                      href={`/admin/careers/${job.id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#6C63FF] hover:border-[#6C63FF] hover:shadow-md transition-all duration-200"
                      title="Edit Job"
                    >
                      <Edit2 size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No job postings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
